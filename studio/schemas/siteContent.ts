import { defineField, defineType } from "sanity";
import { ImageUrlInput } from "../components/ImageUrlInput";

const linkFields = [
  defineField({ name: "label", title: "Label", type: "string" }),
  defineField({ name: "href", title: "URL / Anchor", type: "string" }),
];

const ctaFields = [
  defineField({ name: "primaryCta", title: "Primary CTA Text", type: "string" }),
  defineField({ name: "primaryHref", title: "Primary CTA Link", type: "string" }),
  defineField({ name: "secondaryCta", title: "Secondary CTA Text", type: "string" }),
  defineField({ name: "secondaryHref", title: "Secondary CTA Link", type: "string" }),
];

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

export const siteContent = defineType({
  name: "siteContent",
  title: "Site Content",
  type: "document",
  fields: [
    defineField({
      name: "imageUrls",
      title: "Images",
      type: "object",
      fields: [
        ...imageChoiceFields("logo", "Logo"),
        ...imageChoiceFields("portrait", "Portrait"),
        ...imageChoiceFields("heroPoster", "Hero Image"),
        ...imageChoiceFields("griefBookWrap", "Grief Book Wrap"),
        ...imageChoiceFields("herContinuumMockup", "HerContinuum Mockup"),
        ...imageChoiceFields("griefWorkbookCover", "Workbook Cover"),
        ...imageChoiceFields("workbookSpread", "Workbook Spread"),
        ...imageChoiceFields("griefPromoTall", "Speaking Section Image"),
      ],
    }),
    defineField({
      name: "navItems",
      title: "Navigation Items",
      type: "array",
      of: [{ type: "object", fields: linkFields }],
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "href", title: "URL", type: "url" }),
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              options: {
                list: ["instagram", "tiktok", "facebook"],
              },
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "object",
      fields: [
        defineField({ name: "name", title: "Name", type: "string" }),
        defineField({ name: "tagline", title: "Tagline", type: "string" }),
        defineField({ name: "logoAlt", title: "Logo Alt Text", type: "string" }),
      ],
    }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "titleLineOne", title: "Title Line 1", type: "string" }),
        defineField({ name: "titleLineTwo", title: "Title Line 2", type: "string" }),
        defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
        ...ctaFields,
        defineField({ name: "imageAlt", title: "Image Alt Text", type: "string" }),
      ],
    }),
    defineField({
      name: "statement",
      title: "Statement Bar",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "text", title: "Text", type: "string" }),
      ],
    }),
    defineField({
      name: "about",
      title: "About Section",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "portraitAlt", title: "Portrait Alt Text", type: "string" }),
        defineField({ name: "lead", title: "Lead", type: "text", rows: 3 }),
        defineField({
          name: "paragraphs",
          title: "Paragraphs",
          type: "array",
          of: [{ type: "text", rows: 3 }],
        }),
        defineField({
          name: "highlights",
          title: "Highlight Cards",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "label", title: "Label", type: "string" }),
                defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
              ],
            },
          ],
        }),
        defineField({ name: "missionQuote", title: "Mission Quote", type: "text", rows: 3 }),
        defineField({
          name: "missionStatement",
          title: "Mission Statement",
          type: "text",
          rows: 3,
        }),
        defineField({ name: "signature", title: "Signature", type: "string" }),
      ],
    }),
    defineField({
      name: "speaking",
      title: "Speaking Section",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "title", title: "Title", type: "text", rows: 2 }),
        defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
        defineField({ name: "imageAlt", title: "Image Alt Text", type: "string" }),
        defineField({
          name: "services",
          title: "Services",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "title", title: "Title", type: "string" }),
                defineField({
                  name: "description",
                  title: "Description",
                  type: "text",
                  rows: 3,
                }),
              ],
            },
          ],
        }),
        defineField({ name: "ctaText", title: "CTA Text", type: "text", rows: 2 }),
        ...ctaFields,
      ],
    }),
    defineField({
      name: "booksSection",
      title: "Books Section",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "text", title: "Text", type: "text", rows: 2 }),
        defineField({
          name: "books",
          title: "Books",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "title", title: "Title", type: "string" }),
                defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
                defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
                defineField({
                  name: "imageUrl",
                  title: "Image URL",
                  type: "url",
                  description: "Used first when provided.",
                  components: {
                    input: ImageUrlInput,
                  },
                }),
                defineField({
                  name: "imageUpload",
                  title: "Image Upload",
                  type: "image",
                  description: "Used when no URL is provided.",
                }),
                defineField({
                  name: "imageAlt",
                  title: "Image Alt Text",
                  type: "string",
                }),
                defineField({ name: "badge", title: "Badge", type: "string" }),
                defineField({ name: "cta", title: "CTA Text", type: "string" }),
                defineField({ name: "href", title: "CTA Link", type: "string" }),
              ],
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "testimonialsSection",
      title: "Testimonials",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "text", title: "Text", type: "text", rows: 2 }),
        defineField({
          name: "testimonials",
          title: "Testimonials",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "quote", title: "Quote", type: "text", rows: 4 }),
                defineField({ name: "name", title: "Name", type: "string" }),
                defineField({ name: "role", title: "Role", type: "string" }),
                defineField({ name: "featured", title: "Featured", type: "boolean" }),
              ],
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "newsletter",
      title: "Newsletter",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "text", rows: 2 }),
        defineField({ name: "emailPlaceholder", title: "Email Placeholder", type: "string" }),
        defineField({ name: "submitLabel", title: "Submit Label", type: "string" }),
      ],
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "title", title: "Title", type: "text", rows: 2 }),
        defineField({ name: "text", title: "Intro Text", type: "text", rows: 2 }),
        defineField({
          name: "items",
          title: "FAQ Items",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "question", title: "Question", type: "string" }),
                defineField({ name: "answer", title: "Answer", type: "text", rows: 4 }),
                defineField({ name: "ctaLabel", title: "CTA Label", type: "string" }),
                defineField({ name: "ctaHref", title: "CTA Link", type: "string" }),
              ],
              preview: {
                select: {
                  title: "question",
                  subtitle: "ctaLabel",
                },
              },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "contact",
      title: "Contact",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
        defineField({ name: "email", title: "Email", type: "string" }),
      ],
    }),
    defineField({
      name: "footer",
      title: "Footer",
      type: "object",
      fields: [
        defineField({ name: "brandTagline", title: "Brand Tagline", type: "string" }),
        defineField({ name: "exploreHeading", title: "Explore Heading", type: "string" }),
        defineField({ name: "contactHeading", title: "Contact Heading", type: "string" }),
        defineField({ name: "phone", title: "Phone", type: "string" }),
        defineField({ name: "copyright", title: "Copyright", type: "string" }),
        defineField({ name: "poweredByPrefix", title: "Powered By Prefix", type: "string" }),
        defineField({ name: "poweredByName", title: "Powered By Name", type: "string" }),
        defineField({ name: "poweredByHref", title: "Powered By URL", type: "url" }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "brand.name",
      subtitle: "brand.tagline",
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Site Content",
        subtitle,
      };
    },
  },
});
