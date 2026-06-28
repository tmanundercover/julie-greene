import { defineField, defineType } from "sanity";

export const newsletterSubmission = defineType({
  name: "newsletterSubmission",
  title: "Newsletter Submissions",
  type: "document",
  readOnly: true,
  fields: [
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "source", title: "Source", type: "string" }),
    defineField({ name: "userAgent", title: "User Agent", type: "string" }),
    defineField({ name: "createdAt", title: "Created At", type: "datetime" }),
  ],
  preview: {
    select: {
      title: "email",
      subtitle: "createdAt",
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Newsletter submission",
        subtitle,
      };
    },
  },
});
