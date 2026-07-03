import { defineField, defineType } from "sanity";
import { ImageUrlInput } from "../components/ImageUrlInput";

function imageChoiceFields(name: string, title: string) {
  return [
    defineField({
      name: `${name}Url`,
      title: `${title} URL`,
      type: "url",
      description: "Used first when provided.",
      components: {
        input: ImageUrlInput,
      },
    }),
    defineField({
      name: `${name}Image`,
      title: `${title} Upload`,
      type: "image",
      description: "Used when no URL is provided.",
    }),
  ];
}

export const upcomingEvent = defineType({
  name: "upcomingEvent",
  title: "Upcoming Event / Ad",
  type: "document",
  fields: [
    defineField({
      name: "eventEnabled",
      title: "Show Event",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "eventEyebrow",
      title: "Eyebrow",
      type: "string",
      initialValue: "Upcoming Book Signing",
    }),
    defineField({ name: "eventTitle", title: "Event Title", type: "string" }),
    defineField({ name: "eventDate", title: "Event Date", type: "string" }),
    defineField({ name: "eventTime", title: "Event Time", type: "string" }),
    defineField({ name: "eventLocation", title: "Event Location", type: "string" }),
    defineField({
      name: "eventDescription",
      title: "Event Description",
      type: "text",
      rows: 4,
    }),
    ...imageChoiceFields("eventImage", "Event Image"),
    ...imageChoiceFields("eventQrCode", "Event QR Code"),
    defineField({
      name: "eventbriteUrl",
      title: "Eventbrite URL",
      type: "url",
    }),
    defineField({
      name: "secondaryCtaLabel",
      title: "Secondary CTA Label",
      type: "string",
      initialValue: "Ask about this event",
    }),
    defineField({
      name: "secondaryCtaHref",
      title: "Secondary CTA Link",
      type: "string",
      initialValue: "#contact",
    }),
  ],
  preview: {
    select: {
      title: "eventTitle",
      subtitle: "eventDate",
      enabled: "eventEnabled",
    },
    prepare({ title, subtitle, enabled }) {
      return {
        title: title || "Upcoming Event / Ad",
        subtitle: [enabled ? "On" : "Off", subtitle].filter(Boolean).join(" - "),
      };
    },
  },
});
