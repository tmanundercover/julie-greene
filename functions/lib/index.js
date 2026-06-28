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
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sanityProjectId = process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID;
const sanityDataset = process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET;
const sanityApiVersion = process.env.SANITY_API_VERSION ||
    process.env.VITE_SANITY_API_VERSION ||
    "2025-01-01";
const sanityWriteToken = process.env.SANITY_WRITE_TOKEN || process.env.VITE_SANITY_READ_TOKEN;
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
    return { ok: true, id: doc._id };
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
    return { ok: true, id: doc._id };
});
//# sourceMappingURL=index.js.map