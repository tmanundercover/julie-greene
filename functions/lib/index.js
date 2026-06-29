"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitContact = exports.getSiteContent = exports.submitNewsletter = void 0;
const client_1 = require("@sanity/client");
const https_1 = require("firebase-functions/v2/https");
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
const sanityProjectId = process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID;
const sanityDataset = process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET;
const sanityApiVersion = process.env.SANITY_API_VERSION ||
    process.env.VITE_SANITY_API_VERSION ||
    "2025-01-01";
const sanityWriteToken = process.env.SANITY_WRITE_TOKEN || process.env.VITE_SANITY_READ_TOKEN;
const reasonLabels = {
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
        throw new https_1.HttpsError("failed-precondition", "Sanity is not configured.");
    }
    if (!sanityWriteToken) {
        throw new https_1.HttpsError("failed-precondition", "Sanity write token is not configured.");
    }
    return (0, client_1.createClient)({
        projectId: sanityProjectId,
        dataset: sanityDataset,
        apiVersion: sanityApiVersion,
        token: sanityWriteToken,
        useCdn: false,
    });
}
function cleanString(value, maxLength = 1000) {
    if (typeof value !== "string") {
        return "";
    }
    return value.trim().slice(0, maxLength);
}
function requireString(value, fieldName, maxLength = 1000) {
    const cleaned = cleanString(value, maxLength);
    if (!cleaned) {
        throw new https_1.HttpsError("invalid-argument", `${fieldName} is required.`);
    }
    return cleaned;
}
function requireEmail(value) {
    const email = requireString(value, "Email", 320).toLowerCase();
    if (!emailPattern.test(email)) {
        throw new https_1.HttpsError("invalid-argument", "A valid email is required.");
    }
    return email;
}
function getReasonLabel(value) {
    return reasonLabels[value] ?? value;
}
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function fieldRow(label, value) {
    const cleanValue = value?.trim();
    if (!cleanValue) {
        return "";
    }
    return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(cleanValue)}</p>`;
}
async function getEmailSettings(client) {
    const settings = await client.fetch(emailSettingsQuery);
    const fromEmail = settings?.fromEmail;
    if (!settings || !fromEmail) {
        throw new Error("Email settings fromEmail is not configured in Sanity.");
    }
    return { ...settings, fromEmail };
}
async function sendResendEmail(payload) {
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
async function sendNewsletterNotification(client, email) {
    const settings = await getEmailSettings(client);
    const to = settings.newsletterRecipientEmail || settings.contactRecipientEmail;
    if (!to) {
        throw new Error("Newsletter recipient email is not configured in Sanity.");
    }
    await sendResendEmail({
        from: settings.fromEmail,
        to: [to],
        subject: settings.newsletterSubject ||
            "New Transformative Healing & Wellness newsletter signup",
        html: [
            "<h2>New newsletter signup</h2>",
            fieldRow("Email", email),
            fieldRow("Submitted", new Date().toISOString()),
        ].join(""),
    });
}
async function sendContactNotification(client, contactSubmission) {
    const settings = await getEmailSettings(client);
    const to = settings.contactRecipientEmail;
    if (!to) {
        throw new Error("Contact recipient email is not configured in Sanity.");
    }
    await sendResendEmail({
        from: settings.fromEmail,
        to: [to],
        subject: settings.contactSubject ||
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
            fieldRow("Submitted", new Date().toISOString()),
        ].join(""),
    });
}
exports.submitNewsletter = (0, https_1.onCall)(async (request) => {
    const payload = request.data;
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
    }
    catch (error) {
        console.error("Newsletter notification email failed", error);
        emailSent = false;
    }
    return { ok: true, id: doc._id, emailSent };
});
exports.getSiteContent = (0, https_1.onCall)(async () => {
    const client = getSanityClient();
    const siteContent = await client.fetch(siteContentQuery);
    if (!siteContent) {
        throw new https_1.HttpsError("not-found", "No Sanity site content document found.");
    }
    return siteContent;
});
exports.submitContact = (0, https_1.onCall)(async (request) => {
    const payload = request.data;
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
    }
    catch (error) {
        console.error("Contact notification email failed", error);
        emailSent = false;
    }
    return { ok: true, id: doc._id, emailSent };
});
//# sourceMappingURL=index.js.map