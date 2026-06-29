import { defineField, defineType } from "sanity";

export const emailSettings = defineType({
  name: "emailSettings",
  title: "Email Notification Settings",
  type: "document",
  fields: [
    defineField({
      name: "fromEmail",
      title: "From Email",
      type: "string",
      description:
        "Must be a sender/domain verified in Resend. Example: Transformative Healing & Wellness <admin@transformhw.org>",
    }),
    defineField({
      name: "contactRecipientEmail",
      title: "Contact Form Recipient",
      type: "string",
    }),
    defineField({
      name: "newsletterRecipientEmail",
      title: "Newsletter Signup Recipient",
      type: "string",
    }),
    defineField({
      name: "contactSubject",
      title: "Contact Email Subject",
      type: "string",
    }),
    defineField({
      name: "newsletterSubject",
      title: "Newsletter Email Subject",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "contactRecipientEmail",
      subtitle: "fromEmail",
    },
    prepare({ title, subtitle }) {
      return {
        title: "Email Notification Settings",
        subtitle: [title, subtitle].filter(Boolean).join(" • "),
      };
    },
  },
});
