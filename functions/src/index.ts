import { createClient } from "@sanity/client";
import { HttpsError, onCall } from "firebase-functions/v2/https";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  organization?: unknown;
  reason?: unknown;
  requestedDate?: unknown;
  alternateDate?: unknown;
  eventLocation?: unknown;
  audienceSize?: unknown;
  message?: unknown;
  source?: unknown;
};

type NewsletterPayload = {
  email?: unknown;
  source?: unknown;
};

type EmailSettings = {
  fromEmail?: string;
  contactRecipientEmail?: string;
  newsletterRecipientEmail?: string;
  contactSubject?: string;
  newsletterSubject?: string;
};

type ResendPayload = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  reply_to?: string[];
};

const siteContentQuery = `*[_type in ["siteContent", "cmsData", "homepage", "homePage"]][0]{
  ...,
  imageUrls {
    "logo": coalesce(logoUrl, logoImage.asset->url),
    "portrait": coalesce(portraitUrl, portraitImage.asset->url),
    "heroPoster": coalesce(heroPosterUrl, heroPosterImage.asset->url),
    "griefBookWrap": coalesce(griefBookWrapUrl, griefBookWrapImage.asset->url),
    "herContinuumMockup": coalesce(herContinuumMockupUrl, herContinuumMockupImage.asset->url),
    "griefWorkbookCover": coalesce(griefWorkbookCoverUrl, griefWorkbookCoverImage.asset->url),
    "workbookSpread": coalesce(workbookSpreadUrl, workbookSpreadImage.asset->url),
    "griefPromoTall": coalesce(griefPromoTallUrl, griefPromoTallImage.asset->url)
  },
  booksSection {
    ...,
    books[] {
      ...,
      "image": coalesce(imageUrl, imageUpload.asset->url)
    }
  }
}`;

const emailSettingsQuery = `*[_id == "emailSettings.singleton" && _type == "emailSettings"][0]{
  fromEmail,
  contactRecipientEmail,
  newsletterRecipientEmail,
  contactSubject,
  newsletterSubject
}`;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const resendApiKey = process.env.RESEND_API_KEY;

const sanityProjectId =
  process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID;
const sanityDataset =
  process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET;
const sanityApiVersion =
  process.env.SANITY_API_VERSION ||
  process.env.VITE_SANITY_API_VERSION ||
  "2025-01-01";
const sanityWriteToken =
  process.env.SANITY_WRITE_TOKEN || process.env.VITE_SANITY_READ_TOKEN;

const reasonLabels: Record<string, string> = {
  "speaking-keynote": "Book Speaking & Keynote",
  "speaking-training": "Book EQ & Resilience Training",
  "speaking-workshop": "Book Guided Healing Workshop",
  "book-inquiry": "Book Inquiries",
  "bulk-orders": "Bulk Book Orders",
  "media-interview": "Media / Interview Request",
  partnership: "Partnership Request",
  other: "Other Request",
};

function getSanityClient() {
  if (!sanityProjectId || !sanityDataset || !sanityApiVersion) {
    throw new HttpsError("failed-precondition", "Sanity is not configured.");
  }

  if (!sanityWriteToken) {
    throw new HttpsError(
      "failed-precondition",
      "Sanity write token is not configured."
    );
  }

  return createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
    token: sanityWriteToken,
    useCdn: false,
  });
}

function cleanString(value: unknown, maxLength = 1000) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function requireString(value: unknown, fieldName: string, maxLength = 1000) {
  const cleaned = cleanString(value, maxLength);

  if (!cleaned) {
    throw new HttpsError("invalid-argument", `${fieldName} is required.`);
  }

  return cleaned;
}

function requireEmail(value: unknown) {
  const email = requireString(value, "Email", 320).toLowerCase();

  if (!emailPattern.test(email)) {
    throw new HttpsError("invalid-argument", "A valid email is required.");
  }

  return email;
}

function getReasonLabel(value: string) {
  return reasonLabels[value] ?? value;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fieldRow(label: string, value: string | null | undefined) {
  const cleanValue = value?.trim();

  if (!cleanValue) {
    return "";
  }

  return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(cleanValue)}</p>`;
}

function formatEasternDateTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/New_York",
    timeZoneName: "short",
  }).format(date);
}

async function getEmailSettings(
  client: ReturnType<typeof getSanityClient>
): Promise<EmailSettings & { fromEmail: string }> {
  const settings = await client.fetch<EmailSettings | null>(emailSettingsQuery);
  const fromEmail = settings?.fromEmail;

  if (!settings || !fromEmail) {
    throw new Error("Email settings fromEmail is not configured in Sanity.");
  }

  return { ...settings, fromEmail };
}

async function sendResendEmail(payload: ResendPayload) {
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend email failed: ${response.status} ${body}`);
  }
}

async function sendNewsletterNotification(
  client: ReturnType<typeof getSanityClient>,
  email: string
) {
  const settings = await getEmailSettings(client);
  const to = settings.newsletterRecipientEmail || settings.contactRecipientEmail;

  if (!to) {
    throw new Error("Newsletter recipient email is not configured in Sanity.");
  }

  await sendResendEmail({
    from: settings.fromEmail,
    to: [to],
    subject:
      settings.newsletterSubject ||
      "New Transformative Healing & Wellness newsletter signup",
    html: [
      "<h2>New newsletter signup</h2>",
      fieldRow("Email", email),
      fieldRow("Submitted", formatEasternDateTime()),
    ].join(""),
  });
}

async function sendContactNotification(
  client: ReturnType<typeof getSanityClient>,
  contactSubmission: {
    name: string;
    email: string;
    phone: string;
    organization: string;
    reason: string;
    requestedDate: string;
    alternateDate: string;
    eventLocation: string;
    audienceSize: string;
    message: string;
  }
) {
  const settings = await getEmailSettings(client);
  const to = settings.contactRecipientEmail;

  if (!to) {
    throw new Error("Contact recipient email is not configured in Sanity.");
  }

  await sendResendEmail({
    from: settings.fromEmail,
    to: [to],
    subject:
      settings.contactSubject ||
      "New Transformative Healing & Wellness contact form submission",
    reply_to: [contactSubmission.email],
    html: [
      "<h2>New contact form submission</h2>",
      fieldRow("Name", contactSubmission.name),
      fieldRow("Email", contactSubmission.email),
      fieldRow("Phone", contactSubmission.phone),
      fieldRow("Organization", contactSubmission.organization),
      fieldRow("Reason", getReasonLabel(contactSubmission.reason)),
      fieldRow("Requested date", contactSubmission.requestedDate),
      fieldRow("Alternate date", contactSubmission.alternateDate),
      fieldRow("Event location", contactSubmission.eventLocation),
      fieldRow("Audience size", contactSubmission.audienceSize),
      fieldRow("Message", contactSubmission.message),
      fieldRow("Submitted", formatEasternDateTime()),
    ].join(""),
  });
}

export const submitNewsletter = onCall(async (request) => {
  const payload = request.data as NewsletterPayload;
  const email = requireEmail(payload.email);
  const client = getSanityClient();

  const doc = await client.create({
    _type: "newsletterSubmission",
    email,
    source: cleanString(payload.source, 80) || "newsletter",
    createdAt: new Date().toISOString(),
    userAgent: request.rawRequest.get("user-agent") ?? null,
  });

  let emailSent = true;

  try {
    await sendNewsletterNotification(client, email);
  } catch (error) {
    console.error("Newsletter notification email failed", error);
    emailSent = false;
  }

  return { ok: true, id: doc._id, emailSent };
});

export const getSiteContent = onCall(async () => {
  const client = getSanityClient();
  const siteContent = await client.fetch(siteContentQuery);

  if (!siteContent) {
    throw new HttpsError("not-found", "No Sanity site content document found.");
  }

  return siteContent;
});

export const submitContact = onCall(async (request) => {
  const payload = request.data as ContactPayload;
  const client = getSanityClient();

  const contactSubmission = {
    _type: "contactSubmission",
    name: requireString(payload.name, "Name", 160),
    email: requireEmail(payload.email),
    phone: cleanString(payload.phone, 80),
    organization: cleanString(payload.organization, 180),
    reason: requireString(payload.reason, "Reason", 120),
    requestedDate: cleanString(payload.requestedDate, 40),
    alternateDate: cleanString(payload.alternateDate, 40),
    eventLocation: cleanString(payload.eventLocation, 180),
    audienceSize: cleanString(payload.audienceSize, 80),
    message: requireString(payload.message, "Message", 4000),
    source: cleanString(payload.source, 80) || "contact",
    createdAt: new Date().toISOString(),
    userAgent: request.rawRequest.get("user-agent") ?? null,
  };

  const doc = await client.create(contactSubmission);

  let emailSent = true;

  try {
    await sendContactNotification(client, contactSubmission);
  } catch (error) {
    console.error("Contact notification email failed", error);
    emailSent = false;
  }

  return { ok: true, id: doc._id, emailSent };
});
