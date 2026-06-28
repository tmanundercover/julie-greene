import { defineField, defineType } from "sanity";

export const contactSubmission = defineType({
  name: "contactSubmission",
  title: "Contact Submissions",
  type: "document",
  readOnly: true,
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "organization", title: "Organization", type: "string" }),
    defineField({ name: "reason", title: "Reason", type: "string" }),
    defineField({ name: "requestedDate", title: "Requested Date", type: "string" }),
    defineField({ name: "alternateDate", title: "Alternate Date", type: "string" }),
    defineField({ name: "eventLocation", title: "Event Location", type: "string" }),
    defineField({ name: "audienceSize", title: "Audience Size", type: "string" }),
    defineField({ name: "message", title: "Message", type: "text", rows: 6 }),
    defineField({ name: "source", title: "Source", type: "string" }),
    defineField({ name: "userAgent", title: "User Agent", type: "string" }),
    defineField({ name: "createdAt", title: "Created At", type: "datetime" }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "email",
      createdAt: "createdAt",
    },
    prepare({ title, subtitle, createdAt }) {
      return {
        title: title || "Contact submission",
        subtitle: [subtitle, createdAt].filter(Boolean).join(" • "),
      };
    },
  },
});
