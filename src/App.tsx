import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { createClient } from "@sanity/client";
import { httpsCallable } from "firebase/functions";
import styled, { createGlobalStyle } from "styled-components";
import { firebaseFunctions } from "./firebase";

type SocialIconName = "instagram" | "tiktok" | "facebook";

type ImageUrls = {
  logo: string;
  portrait: string;
  heroPoster: string;
  griefBookWrap: string;
  herContinuumMockup: string;
  griefWorkbookCover: string;
  workbookSpread: string;
  griefPromoTall: string;
};

type NavItem = {
  label: string;
  href: string;
};

type SocialLinkItem = {
  label: string;
  href: string;
  icon: SocialIconName;
};

type Book = {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  badge: string;
  cta: string;
  href: string;
};

type Service = {
  title: string;
  description: string;
};

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  featured: boolean;
};

type FAQItem = {
  question: string;
  answer: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type ContactReason = {
  value: string;
  label: string;
};

type CMSData = {
  imageUrls: ImageUrls;
  navItems: NavItem[];
  socialLinks: SocialLinkItem[];
  brand: {
    name: string;
    tagline: string;
    logoAlt: string;
  };
  hero: {
    eyebrow: string;
    titleLineOne: string;
    titleLineTwo: string;
    text: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta: string;
    secondaryHref: string;
    imageAlt: string;
  };
  statement: {
    title: string;
    text: string;
  };
  about: {
    eyebrow: string;
    title: string;
    portraitAlt: string;
    lead: string;
    paragraphs: string[];
    highlights: { label: string; text: string }[];
    missionQuote: string;
    missionStatement: string;
    signature: string;
  };
  speaking: {
    eyebrow: string;
    title: string;
    text: string;
    imageAlt: string;
    services: Service[];
    ctaText: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta: string;
    secondaryHref: string;
  };
  booksSection: {
    eyebrow: string;
    title: string;
    text: string;
    books: Book[];
  };
  testimonialsSection: {
    eyebrow: string;
    title: string;
    text: string;
    testimonials: Testimonial[];
  };
  newsletter: {
    title: string;
    emailPlaceholder: string;
    submitLabel: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    text: string;
    items: FAQItem[];
  };
  contact: {
    eyebrow: string;
    title: string;
    text: string;
    email: string;
    reasons: ContactReason[];
    speakingReasonValues: string[];
    form: {
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      phoneLabel: string;
      phonePlaceholder: string;
      organizationLabel: string;
      organizationPlaceholder: string;
      reasonLabel: string;
      requestedDateLabel: string;
      alternateDateLabel: string;
      eventLocationLabel: string;
      eventLocationPlaceholder: string;
      audienceSizeLabel: string;
      audienceSizePlaceholder: string;
      messageLabel: string;
      messagePlaceholder: string;
      submitLabel: string;
    };
  };
  footer: {
    brandTagline: string;
    exploreHeading: string;
    contactHeading: string;
    phone: string;
    copyright: string;
    poweredByPrefix: string;
    poweredByName: string;
    poweredByHref: string;
  };
  ui: {
    socialAriaLabel: string;
    openMenuLabel: string;
    closeMenuLabel: string;
    mobileNavigationId: string;
  };
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? DeepPartial<U>[]
    : T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

const defaultCMSData: CMSData = {
  imageUrls: {
    logo:
      "https://firebasestorage.googleapis.com/v0/b/ai-slideshow.firebasestorage.app/o/assets%2Fclients%2Fjulie-greene%2Fjulie-green-logo.png?alt=media",
    portrait:
      "https://firebasestorage.googleapis.com/v0/b/ai-slideshow.firebasestorage.app/o/assets%2Fclients%2Fjulie-greene%2Fjulie-greene-portrait.PNG?alt=media",
    heroPoster:
      "https://firebasestorage.googleapis.com/v0/b/ai-slideshow.firebasestorage.app/o/assets%2Fclients%2Fjulie-greene%2Fjulie-green-hero.png?alt=media",
    griefBookWrap:
      "https://firebasestorage.googleapis.com/v0/b/ai-slideshow.firebasestorage.app/o/assets%2Fclients%2Fjulie-greene%2Fintentionally-living-beyond-grief-wrap.png?alt=media",
    herContinuumMockup:
      "https://firebasestorage.googleapis.com/v0/b/ai-slideshow.firebasestorage.app/o/assets%2Fclients%2Fjulie-greene%2Fjulie-greene-her-continum-wrap.png?alt=media",
    griefWorkbookCover:
      "https://firebasestorage.googleapis.com/v0/b/ai-slideshow.firebasestorage.app/o/assets%2Fclients%2Fjulie-greene%2Fintentionally-living-beyond-grief-workbook-wrap.png?alt=media",
    workbookSpread:
      "https://firebasestorage.googleapis.com/v0/b/ai-slideshow.firebasestorage.app/o/assets%2Fclients%2Fjulie-greene%2Fjulie-green-intentially-living-poster-transparent.png?alt=media",
    griefPromoTall:
      "https://firebasestorage.googleapis.com/v0/b/ai-slideshow.firebasestorage.app/o/assets%2Fclients%2Fjulie-greene%2Fjulie-greene-leading-with-intelligence.png?alt=media",
  },
  navItems: [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Speaking", href: "#speaking" },
    { label: "Books", href: "#books" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
  socialLinks: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/transformativehw",
      icon: "instagram",
    },
    {
      label: "TikTok",
      href: "https://www.tiktok.com/@transformhw?_r=1&_t=ZP-97GbLkGy6Wd",
      icon: "tiktok",
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/share/1CykcNBEuY/?mibextid=wwXIfr",
      icon: "facebook",
    },
  ],
  brand: {
    name: "Julie J. Greene",
    tagline: "Intentionally Living",
    logoAlt: "Julie J. Greene logo",
  },
  hero: {
    eyebrow: "Author • Speaker • EQ & Resilience Strategist",
    titleLineOne: "Heal. Grow.",
    titleLineTwo: "Live Intentionally.",
    text: "Julie J. Greene creates books, guided journals, and healing experiences for people navigating grief, emotional growth, and life after loss.",
    primaryCta: "Explore the Books",
    primaryHref: "#books",
    secondaryCta: "Meet Julie",
    secondaryHref: "#about",
    imageAlt: "Julie J. Greene book promotion",
  },
  statement: {
    title: "Not just resilient. Transformational.",
    text: "Reflections, healing, hope, and a journey back to you.",
  },
  about: {
    eyebrow: "About Julie",
    title: "Julie J. Greene, MSW, LCSW-C, EQPC",
    portraitAlt: "Julie J. Greene portrait",
    lead: "Julie J. Greene is an Author, Emotional Intelligence Practitioner, Mental Wellness and Resilience Strategist, Educator, and Founder & CEO of Transformative Healing & Wellness, LLC.",
    paragraphs: [
      "With more than three decades of experience in behavioral health, leadership development, higher education, and community wellness, she is passionate about helping individuals and organizations navigate life's challenges with purpose, resilience, and intention.",
      "Through her writing, speaking engagements, workshops, and training programs, Julie empowers others to move beyond surviving and toward thriving by cultivating emotional wellness, resilience, and intentional living.",
      "Whether speaking from a stage, facilitating a workshop, coaching professionals, or writing from her own lived experiences, Julie inspires others to reclaim their power, strengthen their resilience, and author lives filled with purpose, meaning, and possibility.",
    ],
    highlights: [
      {
        label: "Author Of",
        text: "HerContinuum™, Intentionally Living Beyond Grief, and the Intentionally Living Beyond Grief Companion Workbook.",
      },
      {
        label: "Education & Leadership",
        text: "Adjunct Professor and Practicum Liaison at Morgan State University School of Social Work, helping prepare future social work professionals.",
      },
    ],
    missionQuote:
      "Life's most difficult experiences can become catalysts for transformation when we choose to heal, grow, and live intentionally.",
    missionStatement:
      "Julie’s mission is to help people move from surviving to thriving — one intentional choice at a time.",
    signature: "Julie J. Greene",
  },
  speaking: {
    eyebrow: "Speaking and Support",
    title:
      "Bring emotional intelligence, resilience, and intentional living to your audience.",
    text: "Julie speaks to organizations, universities, conferences, faith communities, women’s groups, leadership teams, and wellness audiences seeking meaningful conversations about healing, emotional resilience, and transformation.",
    imageAlt: "Julie J. Greene speaking and book promotion",
    services: [
      {
        title: "Speaking & Keynotes",
        description:
          "Powerful talks on grief, resilience, emotional intelligence, intentional living, and healing-centered transformation.",
      },
      {
        title: "EQ & Resilience Training",
        description:
          "Training experiences that help leaders, teams, and communities strengthen emotional intelligence and navigate challenges with clarity.",
      },
      {
        title: "Guided Healing Workshops",
        description:
          "Reflective group experiences designed to support healing, growth, self-awareness, and purposeful forward movement.",
      },
    ],
    ctaText:
      "Invite Julie to speak, facilitate a workshop, or design a healing-centered experience for your organization.",
    primaryCta: "Book Julie",
    primaryHref: "#contact",
    secondaryCta: "View Her Books",
    secondaryHref: "#books",
  },
  booksSection: {
    eyebrow: "Book Collection",
    title: "Guided resources for grief, healing, and intentional living.",
    text: "Julie’s work supports readers through loss, identity, emotional safety, reflection, and purposeful growth.",
    books: [
      {
        title: "HerContinuum™",
        subtitle: "A Journal for Motherless Daughters",
        description:
          "A gentle reflection journal created for the motherless daughter — the woman learning to live with love and loss in the same space.",
        image:
          "https://firebasestorage.googleapis.com/v0/b/ai-slideshow.firebasestorage.app/o/assets%2Fclients%2Fjulie-greene%2Fjulie-greene-her-continum-wrap.png?alt=media",
        badge: "Guided Journal",
        cta: "View Journal",
        href: "https://www.amazon.com/HerContinuumTM-Reflection-Journal-Motherless-Daughters/dp/B0GX9BZHB6?ref_=ast_author_dp&th=1&psc=1",
      },
      {
        title: "Intentionally Living Beyond Grief",
        subtitle: "Reflections, Healing, and Hope",
        description:
          "A compassionate companion for navigating grief with intention, courage, and hope. Created for readers moving through loss, transition, and the work of healing without losing themselves.",
        image:
          "https://firebasestorage.googleapis.com/v0/b/ai-slideshow.firebasestorage.app/o/assets%2Fclients%2Fjulie-greene%2Fintentionally-living-beyond-grief-wrap.png?alt=media",
        badge: "Book",
        cta: "Buy the Book",
        href: "https://www.amazon.com/Intentionally-Living-Beyond-Grief-Intentional/dp/9696093861?ref_=ast_author_dp&th=1&psc=1",
      },
      {
        title: "Intentionally Living Beyond Grief Companion Workbook",
        subtitle:
          "A Guided Journey Toward Healing, Growth, and Intentional Living",
        description:
          "The companion workbook with guided reflections, exercises, and activities to help readers process grief, rediscover purpose, and move forward with clarity.",
        image:
          "https://firebasestorage.googleapis.com/v0/b/ai-slideshow.firebasestorage.app/o/assets%2Fclients%2Fjulie-greene%2Fintentionally-living-beyond-grief-workbook-wrap.png?alt=media",
        badge: "Companion Workbook",
        cta: "View Workbook",
        href: "#contact",
      },
    ],
  },
  testimonialsSection: {
    eyebrow: "Testimonial",
    title: "Words from readers and reviewers.",
    text: "Julie’s writing and teaching create space for honest reflection, healing, and meaningful transformation.",
    testimonials: [
      {
        quote:
          "Julie’s work meets readers with compassion, honesty, and hope. Her words create space for grief while gently guiding people toward healing, resilience, and intentional living.",
        name: "Editor Testimonial",
        role: "Editorial Review",
        featured: true,
      },
    ],
  },
  newsletter: {
    title:
      "Stay connected for book updates, events, reflections, and speaking opportunities.",
    emailPlaceholder: "Email Address",
    submitLabel: "Subscribe",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Common questions about Julie’s books, speaking, and grief wellness work.",
    text: "Quick answers for event planners, readers, organizations, and people looking for grief support resources.",
    items: [
      {
        question: "Does Julie J. Greene speak at events?",
        answer:
          "Yes. Julie J. Greene speaks at conferences, universities, organizations, faith communities, women’s groups, wellness events, and leadership gatherings. Her speaking work focuses on grief, resilience, emotional wellness, emotional intelligence, healing, and intentional living.",
      },
      {
        question: "What topics does Julie speak about?",
        answer:
          "Julie speaks about grief support, resilience, emotional intelligence, mental wellness, intentional living, healing after loss, leadership wellness, and transformation through difficult life experiences.",
        ctaLabel: "View speaking topics",
        ctaHref: "#speaking",
      },
      {
        question: "What books has Julie J. Greene written?",
        answer:
          "Julie J. Greene is the author of HerContinuum™, Intentionally Living Beyond Grief, and the Intentionally Living Beyond Grief Companion Workbook. These resources support reflection, healing, grief processing, emotional growth, and intentional living.",
        ctaLabel: "Explore the books",
        ctaHref: "#books",
      },
      {
        question: "Are Julie’s books for grief support?",
        answer:
          "Yes. Julie’s books and guided journals are designed for grief support, especially for readers navigating loss, identity shifts, healing, emotional wellness, and life after grief. They offer reflective prompts, compassionate language, and practical encouragement for moving forward with intention.",
      },
      {
        question: "How do I request Julie for a workshop or keynote?",
        answer:
          "To request Julie J. Greene for a workshop, keynote, training, interview, or healing-centered event, use the contact form and select the reason that best matches your request. Include the event date, location, audience size, and goals for the session.",
        ctaLabel: "Request Julie",
        ctaHref: "#contact",
      },
    ],
  },
  contact: {
    eyebrow: "Contact Julie",
    title: "Start the conversation about books, speaking, or partnership.",
    text: "Use the form to request a speaking engagement, ask about Julie’s books and workbooks, discuss bulk orders, or explore a healing-centered collaboration.",
    email: "admin@transformhw.org",
    reasons: [
      { value: "", label: "Select a reason for contacting" },
      { value: "speaking-keynote", label: "Book Speaking & Keynote" },
      { value: "speaking-training", label: "Book EQ & Resilience Training" },
      { value: "speaking-workshop", label: "Book Guided Healing Workshop" },
      { value: "book-inquiry", label: "Book Inquiries" },
      { value: "bulk-orders", label: "Bulk Book Orders" },
      { value: "media-interview", label: "Media / Interview Request" },
      { value: "partnership", label: "Partnership Request" },
      { value: "other", label: "Other Request" },
    ],
    speakingReasonValues: [
      "speaking-keynote",
      "speaking-training",
      "speaking-workshop",
    ],
    form: {
      nameLabel: "Name *",
      namePlaceholder: "Your name",
      emailLabel: "Email *",
      emailPlaceholder: "you@example.com",
      phoneLabel: "Phone",
      phonePlaceholder: "Optional",
      organizationLabel: "Organization",
      organizationPlaceholder: "School, company, church, group, etc.",
      reasonLabel: "Reason for contacting *",
      requestedDateLabel: "Requested date *",
      alternateDateLabel: "Alternate date",
      eventLocationLabel: "Event location *",
      eventLocationPlaceholder: "City, state, or virtual",
      audienceSizeLabel: "Expected audience size *",
      audienceSizePlaceholder: "Approximate number",
      messageLabel: "Message *",
      messagePlaceholder: "Tell Julie what you are looking for...",
      submitLabel: "Send Message",
    },
  },
  footer: {
    brandTagline: "Heal. Grow. Live Intentionally.",
    exploreHeading: "Explore",
    contactHeading: "Contact",
    phone: "443.940.5550",
    copyright: "© 2026 Julie J. Greene. All rights reserved.",
    poweredByPrefix: "Powered by",
    poweredByName: "The Handsomest Nerd",
    poweredByHref: "https://www.instagram.com/thehandsomestnerdwebdeveloper",
  },
  ui: {
    socialAriaLabel: "Social media links",
    openMenuLabel: "Open menu",
    closeMenuLabel: "Close menu",
    mobileNavigationId: "mobile-navigation",
  },
};

function SocialIcon({ icon }: { icon: SocialIconName }) {
  if (icon === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.25" />
        <circle cx="17.5" cy="6.5" r="1" className="fill" />
      </svg>
    );
  }

  if (icon === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.2 3v11.3a4.7 4.7 0 1 1-4-4.65v3.2a1.7 1.7 0 1 0 1 1.55V3h3Z" />
        <path d="M14.2 3c.5 2.65 2.05 4.2 4.8 4.65v3.05a8.2 8.2 0 0 1-4.8-1.75" />
      </svg>
    );
  }

  return (
    <svg className="solid" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.75 21v-8h2.75l.4-3h-3.15V8.1c0-.87.25-1.47 1.58-1.47H17V3.95c-.29-.04-1.28-.12-2.44-.12-2.41 0-4.06 1.47-4.06 4.18V10H7.75v3h2.75v8h3.25Z" />
    </svg>
  );
}

function SocialLinks({
  className,
  links,
  ariaLabel,
}: {
  className?: string;
  links: SocialLinkItem[];
  ariaLabel: string;
}) {
  return (
    <SocialList className={className} aria-label={ariaLabel}>
      {links.map((social) => (
        <SocialLink
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          aria-label={social.label}
          title={social.label}
        >
          <SocialIcon icon={social.icon} />
        </SocialLink>
      ))}
    </SocialList>
  );
}

const sanityEnv =
  (import.meta as unknown as {
    env?: Record<string, string | undefined>;
  }).env ?? {};

const sanityProjectId = sanityEnv.VITE_SANITY_PROJECT_ID;
const sanityDataset = sanityEnv.VITE_SANITY_DATASET;
const sanityReadToken = sanityEnv.VITE_SANITY_READ_TOKEN;
const sanityApiVersion = sanityEnv.VITE_SANITY_API_VERSION;

const hasSanityReadConfig = () =>
  Boolean(sanityProjectId && sanityDataset && sanityApiVersion);

const sanityQuery = `*[_type in ["siteContent", "cmsData", "homepage", "homePage"]][0]{
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasUsableString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function mergeCMSData<T>(fallback: T, incoming: DeepPartial<T> | undefined): T {
  if (incoming === undefined || incoming === null) {
    return fallback;
  }

  if (typeof fallback === "string") {
    return (hasUsableString(incoming) ? incoming : fallback) as T;
  }

  if (typeof fallback === "boolean") {
    return (typeof incoming === "boolean" ? incoming : fallback) as T;
  }

  if (Array.isArray(fallback)) {
    if (!Array.isArray(incoming) || incoming.length === 0) {
      return fallback;
    }

    const maxLength = Math.max(fallback.length, incoming.length);

    return Array.from({ length: maxLength })
      .map((_, index) => {
        const item = incoming[index];
        const fallbackItem = fallback[index];

        if (item === undefined || item === null) {
          return fallbackItem;
        }

        if (fallbackItem === undefined) {
          return item;
        }

        return mergeCMSData(fallbackItem, item);
      })
      .filter((item) => item !== undefined && item !== null) as T;
  }

  if (isRecord(fallback) && isRecord(incoming)) {
    const fallbackRecord = fallback as Record<string, unknown>;
    const incomingRecord = incoming as Record<string, unknown>;
    const merged = { ...fallbackRecord };

    Object.keys(fallbackRecord).forEach((key) => {
      merged[key] = mergeCMSData(
        fallbackRecord[key],
        incomingRecord[key] as DeepPartial<unknown>
      );
    });

    return merged as T;
  }

  return (incoming ?? fallback) as T;
}

function normalizeSanityContent(raw: unknown): DeepPartial<CMSData> {
  if (!isRecord(raw)) {
    return {};
  }

  if (isRecord(raw.content)) {
    return raw.content as DeepPartial<CMSData>;
  }

  return raw as DeepPartial<CMSData>;
}

async function fetchCMSDataFromSanity(): Promise<DeepPartial<CMSData>> {
  const projectId = sanityProjectId;
  const dataset = sanityDataset;
  const apiVersion = sanityApiVersion;

  if (!projectId || !dataset || !apiVersion) {
    return {};
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    ...(sanityReadToken ? { token: sanityReadToken } : {}),
    useCdn: !sanityReadToken,
  });

  const response = await client.fetch(sanityQuery);
  return normalizeSanityContent(response);
}

function useCMS() {
  const [data, setData] = useState<CMSData>(defaultCMSData);
  const [loading, setLoading] = useState(hasSanityReadConfig());
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!hasSanityReadConfig()) {
      setData(defaultCMSData);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    try {
      const sanityContent = await fetchCMSDataFromSanity();
      setData(mergeCMSData(defaultCMSData, sanityContent));
      setError(null);
    } catch (cmsError) {
      setData(defaultCMSData);
      setError(
        cmsError instanceof Error
          ? cmsError
          : new Error("Unable to load Sanity CMS content")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

const sectionViewport = {
  once: true,
  amount: 0.35,
  margin: "0px 0px -80px 0px",
} as const;

const itemViewport = {
  once: true,
  amount: 0.55,
  margin: "0px 0px -120px 0px",
} as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -34 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 34 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const cardContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

export default function App() {
  const cms = useCMS();
  const content = cms.data;
  const imageUrls = content.imageUrls;
  const navItems = content.navItems;
  const socialLinks = content.socialLinks;
  const mainTestimonial = content.testimonialsSection.testimonials[0];
  const supportingTestimonials = content.testimonialsSection.testimonials.slice(1);
  const [email, setEmail] = useState("");
  const [contactReason, setContactReason] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);

  const isSpeakingRequest =
    content.contact.speakingReasonValues.includes(contactReason);

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || newsletterSubmitting) {
      return;
    }

    setNewsletterSubmitting(true);

    try {
      const submitNewsletter = httpsCallable(firebaseFunctions, "submitNewsletter");
      await submitNewsletter({
        email: email.trim(),
        submittedAt: new Date().toISOString(),
        source: "newsletter",
      });
      setEmail("");
    } finally {
      setNewsletterSubmitting(false);
    }
  }

  async function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (contactSubmitting) {
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [
        key,
        typeof value === "string" ? value : "",
      ])
    );

    setContactSubmitting(true);

    try {
      const submitContact = httpsCallable(firebaseFunctions, "submitContact");
      await submitContact({
        ...payload,
        submittedAt: new Date().toISOString(),
        source: "contact",
      });
      form.reset();
      setContactReason("");
    } finally {
      setContactSubmitting(false);
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <GlobalStyle />

      <Page>
        <Nav>
          <Brand href="#home" onClick={closeMenu}>
            <Logo src={imageUrls.logo} alt={content.brand.logoAlt} />
            <BrandText>
              <strong>{content.brand.name}</strong>
              <span>{content.brand.tagline}</span>
            </BrandText>
          </Brand>

          <DesktopNavigation>
            <NavLinks>
              {navItems.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </NavLinks>
            <SocialLinks
              links={socialLinks}
              ariaLabel={content.ui.socialAriaLabel}
            />
          </DesktopNavigation>

          <MenuButton
            type="button"
            aria-label={
              menuOpen ? content.ui.closeMenuLabel : content.ui.openMenuLabel
            }
            aria-expanded={menuOpen}
            aria-controls={content.ui.mobileNavigationId}
            $open={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </MenuButton>
        </Nav>

        <MobileMenu id={content.ui.mobileNavigationId} $open={menuOpen}>
          {navItems.map((item) => (
            <MobileMenuLink key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </MobileMenuLink>
          ))}
          <MobileSocials>
            <SocialLinks
              links={socialLinks}
              ariaLabel={content.ui.socialAriaLabel}
            />
          </MobileSocials>
        </MobileMenu>

        <Hero
          id="home"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={fadeIn}
        >
          <HeroGlow />

          <HeroInner>
            <HeroCopy variants={slideInLeft}>
              <Pill>{content.hero.eyebrow}</Pill>

              <HeroTitle>
                {content.hero.titleLineOne}
                <br />
                {content.hero.titleLineTwo}
              </HeroTitle>

              <HeroText>{content.hero.text}</HeroText>

              <ButtonRow>
                <PrimaryButton href={content.hero.primaryHref}>
                  {content.hero.primaryCta}
                </PrimaryButton>
                <SecondaryButton href={content.hero.secondaryHref}>
                  {content.hero.secondaryCta}
                </SecondaryButton>
              </ButtonRow>
            </HeroCopy>

            <HeroImageWrap variants={slideInRight}>
              <HeroImage
                src={imageUrls.heroPoster}
                alt={content.hero.imageAlt}
              />
            </HeroImageWrap>
          </HeroInner>
        </Hero>

        <StatementBar
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={fadeUp}
        >
          <StatementInner>
            <strong>{content.statement.title}</strong>
            <span>{content.statement.text}</span>
          </StatementInner>
        </StatementBar>

        <About
          id="about"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={cardContainer}
        >
          <AboutImageWrap
            initial="hidden"
            whileInView="visible"
            viewport={itemViewport}
            variants={slideInLeft}
          >
            <AboutImage src={imageUrls.portrait} alt={content.about.portraitAlt} />
          </AboutImageWrap>

          <AboutContent>
            <Eyebrow
              initial="hidden"
              whileInView="visible"
              viewport={itemViewport}
              variants={cardReveal}
            >
              {content.about.eyebrow}
            </Eyebrow>

            <SectionTitle
              initial="hidden"
              whileInView="visible"
              viewport={itemViewport}
              variants={cardReveal}
            >
              {content.about.title}
            </SectionTitle>

            <BioLead
              initial="hidden"
              whileInView="visible"
              viewport={itemViewport}
              variants={cardReveal}
            >
              {content.about.lead}
            </BioLead>

            {content.about.paragraphs[0] && (
              <BioText
                initial="hidden"
                whileInView="visible"
                viewport={itemViewport}
                variants={cardReveal}
              >
                {content.about.paragraphs[0]}
              </BioText>
            )}

            <BioHighlights>
              {content.about.highlights.map((highlight) => (
                <BioHighlightCard
                  key={highlight.label}
                  initial="hidden"
                  whileInView="visible"
                  viewport={itemViewport}
                  variants={cardReveal}
                >
                  <BioCardLabel>{highlight.label}</BioCardLabel>
                  <BioCardText>{highlight.text}</BioCardText>
                </BioHighlightCard>
              ))}
            </BioHighlights>

            {content.about.paragraphs[1] && (
              <BioText
                initial="hidden"
                whileInView="visible"
                viewport={itemViewport}
                variants={cardReveal}
              >
                {content.about.paragraphs[1]}
              </BioText>
            )}

            <MissionCard
              initial="hidden"
              whileInView="visible"
              viewport={itemViewport}
              variants={fadeUp}
            >
              <QuoteMark>“</QuoteMark>
              <MissionText>{content.about.missionQuote}</MissionText>
            </MissionCard>

            {content.about.paragraphs[2] && (
              <BioText
                initial="hidden"
                whileInView="visible"
                viewport={itemViewport}
                variants={cardReveal}
              >
                {content.about.paragraphs[2]}
              </BioText>
            )}

            <BioMission
              initial="hidden"
              whileInView="visible"
              viewport={itemViewport}
              variants={cardReveal}
            >
              {content.about.missionStatement}
            </BioMission>

            <Signature
              initial="hidden"
              whileInView="visible"
              viewport={itemViewport}
              variants={cardReveal}
            >
              {content.about.signature}
            </Signature>
          </AboutContent>
        </About>

        <SpeakingCtaSection
          id="speaking"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={fadeIn}
        >
          <SpeakingCtaGrid>
            <SpeakingIntro
              initial="hidden"
              whileInView="visible"
              viewport={itemViewport}
              variants={fadeUp}
            >
              <Eyebrow>{content.speaking.eyebrow}</Eyebrow>

              <SectionTitle>{content.speaking.title}</SectionTitle>

              <SectionText>{content.speaking.text}</SectionText>
            </SpeakingIntro>

            <SpeakingContentRow
              initial="hidden"
              whileInView="visible"
              viewport={itemViewport}
              variants={cardContainer}
            >
              <SpeakingImageWrap variants={slideInLeft}>
                <SpeakingImage
                  src={imageUrls.griefPromoTall}
                  alt={content.speaking.imageAlt}
                />
              </SpeakingImageWrap>

              <SpeakingServiceGrid>
                {content.speaking.services.map((service) => (
                  <SpeakingServiceCard key={service.title} variants={cardReveal}>
                    <ServiceTitle>{service.title}</ServiceTitle>
                    <ServiceText>{service.description}</ServiceText>
                  </SpeakingServiceCard>
                ))}
              </SpeakingServiceGrid>
            </SpeakingContentRow>

            <CtaCard
              initial="hidden"
              whileInView="visible"
              viewport={itemViewport}
              variants={fadeUp}
            >
              <CtaText>{content.speaking.ctaText}</CtaText>

              <ButtonRow>
                <PrimaryButton href={content.speaking.primaryHref}>
                  {content.speaking.primaryCta}
                </PrimaryButton>
                <SecondaryButton href={content.speaking.secondaryHref}>
                  {content.speaking.secondaryCta}
                </SecondaryButton>
              </ButtonRow>
            </CtaCard>
          </SpeakingCtaGrid>
        </SpeakingCtaSection>

        <BookSection
          id="books"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={fadeIn}
        >
          <CenteredHeader
            initial="hidden"
            whileInView="visible"
            viewport={itemViewport}
            variants={fadeUp}
          >
            <Eyebrow>{content.booksSection.eyebrow}</Eyebrow>
            <SectionTitle>{content.booksSection.title}</SectionTitle>
            <SectionText>{content.booksSection.text}</SectionText>
          </CenteredHeader>

          <BookGrid
            initial="hidden"
            whileInView="visible"
            viewport={itemViewport}
            variants={cardContainer}
          >
            {content.booksSection.books.map((book) => (
              <BookCard
                key={book.title}
                variants={cardReveal}
                initial="rest"
                whileHover="hover"
              >
                <BookImageFrame
                  href={book.href}
                  target={book.href.startsWith("http") ? "_blank" : undefined}
                  rel={book.href.startsWith("http") ? "noreferrer" : undefined}
                  aria-label={`${book.cta}: ${book.title}`}
                  variants={{
                    rest: { y: 0 },
                    hover: {
                      y: 0,
                      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  <BookImage
                    src={book.image}
                    alt={book.title}
                    variants={{
                      rest: { scale: 1, rotate: 0 },
                      hover: {
                        scale: 1.035,
                        rotate: -1,
                        transition: {
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                    }}
                  />
                </BookImageFrame>

                <BookContent>
                  <BookBadge>{book.badge}</BookBadge>
                  <BookTitle>{book.title}</BookTitle>
                  <BookSubtitle>{book.subtitle}</BookSubtitle>
                  <BookDescription>{book.description}</BookDescription>
                  <BookButton
                    href={book.href}
                    target={book.href.startsWith("http") ? "_blank" : undefined}
                    rel={book.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    {book.cta}
                  </BookButton>
                </BookContent>
              </BookCard>
            ))}
          </BookGrid>
        </BookSection>

        <TestimonialSection
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={fadeIn}
        >
          <TestimonialInner>
            <TestimonialHeader
              initial="hidden"
              whileInView="visible"
              viewport={itemViewport}
              variants={fadeUp}
            >
              <Eyebrow>{content.testimonialsSection.eyebrow}</Eyebrow>
              <SectionTitle>{content.testimonialsSection.title}</SectionTitle>
              <SectionText>{content.testimonialsSection.text}</SectionText>
            </TestimonialHeader>

            {mainTestimonial && (
              <MainTestimonialCard
                initial="hidden"
                whileInView="visible"
                viewport={itemViewport}
                variants={fadeUp}
              >
                <TestimonialLabel>{mainTestimonial.role}</TestimonialLabel>
                <MainQuote>“{mainTestimonial.quote}”</MainQuote>

                <TestimonialAuthor>
                  <strong>{mainTestimonial.name}</strong>
                  <span>{mainTestimonial.role}</span>
                </TestimonialAuthor>
              </MainTestimonialCard>
            )}

            {supportingTestimonials.length > 0 && (
              <SupportingTestimonialGrid>
                {supportingTestimonials.map((testimonial) => (
                  <SmallTestimonialCard
                    key={testimonial.name}
                    variants={cardReveal}
                  >
                    <SmallQuote>“{testimonial.quote}”</SmallQuote>
                    <TestimonialAuthor>
                      <strong>{testimonial.name}</strong>
                      <span>{testimonial.role}</span>
                    </TestimonialAuthor>
                  </SmallTestimonialCard>
                ))}
              </SupportingTestimonialGrid>
            )}
          </TestimonialInner>
        </TestimonialSection>

        <Newsletter
          id="newsletter"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={fadeIn}
        >
          <NewsletterInner>
            <NewsletterTitle
              initial="hidden"
              whileInView="visible"
              viewport={itemViewport}
              variants={slideInLeft}
            >
              {content.newsletter.title}
            </NewsletterTitle>

            <NewsletterForm
              onSubmit={handleNewsletterSubmit}
              initial="hidden"
              whileInView="visible"
              viewport={itemViewport}
              variants={slideInRight}
            >
              <Input
                type="email"
                placeholder={content.newsletter.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <SubscribeButton type="submit" disabled={newsletterSubmitting}>
                {content.newsletter.submitLabel}
              </SubscribeButton>
            </NewsletterForm>
          </NewsletterInner>
        </Newsletter>

        <FAQSection
          id="faq"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={fadeIn}
        >
          <FAQInner>
            <FAQHeader
              initial="hidden"
              whileInView="visible"
              viewport={itemViewport}
              variants={fadeUp}
            >
              <Eyebrow>{content.faq.eyebrow}</Eyebrow>
              <SectionTitle>{content.faq.title}</SectionTitle>
              <SectionText>{content.faq.text}</SectionText>
            </FAQHeader>

            <FAQList
              initial="hidden"
              whileInView="visible"
              viewport={itemViewport}
              variants={cardContainer}
            >
              {content.faq.items.map((item, index) => {
                const isOpen = openFAQIndex === index;
                const answerId = `faq-answer-${index}`;

                return (
                  <FAQItemCard key={item.question} variants={cardReveal}>
                    <FAQQuestion
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() =>
                        setOpenFAQIndex((currentIndex) =>
                          currentIndex === index ? null : index
                        )
                      }
                    >
                      <span>{item.question}</span>
                      <FAQIcon
                        aria-hidden="true"
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        whileHover={{ rotate: isOpen ? 360 : 90, scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                      >
                        {isOpen ? "−" : "+"}
                      </FAQIcon>
                    </FAQQuestion>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <FAQAnswerWrap
                          id={answerId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: "easeOut" }}
                        >
                          <FAQAnswer>
                            <p>{item.answer}</p>
                            {item.ctaLabel && item.ctaHref && (
                              <FAQCta href={item.ctaHref}>{item.ctaLabel}</FAQCta>
                            )}
                          </FAQAnswer>
                        </FAQAnswerWrap>
                      )}
                    </AnimatePresence>
                  </FAQItemCard>
                );
              })}
            </FAQList>
          </FAQInner>
        </FAQSection>

        <ContactSection
          id="contact"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={fadeIn}
        >
          <ContactGrid>
            <ContactIntro
              initial="hidden"
              whileInView="visible"
              viewport={itemViewport}
              variants={slideInLeft}
            >
              <Eyebrow>{content.contact.eyebrow}</Eyebrow>
              <SectionTitle>{content.contact.title}</SectionTitle>
              <ContactText>{content.contact.text}</ContactText>
              <ContactEmail href={`mailto:${content.contact.email}`}>
                {content.contact.email}
              </ContactEmail>
            </ContactIntro>

            <ContactForm
              onSubmit={handleContactSubmit}
              initial="hidden"
              whileInView="visible"
              viewport={itemViewport}
              variants={slideInRight}
            >
              <FormGrid>
                <Field>
                  <Label htmlFor="name">{content.contact.form.nameLabel}</Label>
                  <TextInput
                    id="name"
                    name="name"
                    placeholder={content.contact.form.namePlaceholder}
                    required
                  />
                </Field>

                <Field>
                  <Label htmlFor="email">{content.contact.form.emailLabel}</Label>
                  <TextInput
                    id="email"
                    name="email"
                    type="email"
                    placeholder={content.contact.form.emailPlaceholder}
                    required
                  />
                </Field>

                <Field>
                  <Label htmlFor="phone">{content.contact.form.phoneLabel}</Label>
                  <TextInput
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={content.contact.form.phonePlaceholder}
                  />
                </Field>

                <Field>
                  <Label htmlFor="organization">
                    {content.contact.form.organizationLabel}
                  </Label>
                  <TextInput
                    id="organization"
                    name="organization"
                    placeholder={content.contact.form.organizationPlaceholder}
                  />
                </Field>

                <FullField>
                  <Label htmlFor="reason">
                    {content.contact.form.reasonLabel}
                  </Label>
                  <SelectInput
                    id="reason"
                    name="reason"
                    value={contactReason}
                    onChange={(e) => setContactReason(e.target.value)}
                    required
                  >
                    {content.contact.reasons.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </SelectInput>
                </FullField>

                {isSpeakingRequest && (
                  <>
                    <Field>
                      <Label htmlFor="requestedDate">
                        {content.contact.form.requestedDateLabel}
                      </Label>
                      <TextInput
                        id="requestedDate"
                        name="requestedDate"
                        type="date"
                        required
                      />
                    </Field>

                    <Field>
                      <Label htmlFor="alternateDate">
                        {content.contact.form.alternateDateLabel}
                      </Label>
                      <TextInput
                        id="alternateDate"
                        name="alternateDate"
                        type="date"
                      />
                    </Field>

                    <Field>
                      <Label htmlFor="eventLocation">
                        {content.contact.form.eventLocationLabel}
                      </Label>
                      <TextInput
                        id="eventLocation"
                        name="eventLocation"
                        placeholder={content.contact.form.eventLocationPlaceholder}
                        required
                      />
                    </Field>

                    <Field>
                      <Label htmlFor="audienceSize">
                        {content.contact.form.audienceSizeLabel}
                      </Label>
                      <TextInput
                        id="audienceSize"
                        name="audienceSize"
                        placeholder={content.contact.form.audienceSizePlaceholder}
                        required
                      />
                    </Field>
                  </>
                )}

                <FullField>
                  <Label htmlFor="message">
                    {content.contact.form.messageLabel}
                  </Label>
                  <TextArea
                    id="message"
                    name="message"
                    placeholder={content.contact.form.messagePlaceholder}
                    required
                  />
                </FullField>
              </FormGrid>

              <SubmitButton type="submit" disabled={contactSubmitting}>
                {content.contact.form.submitLabel}
              </SubmitButton>
            </ContactForm>
          </ContactGrid>
        </ContactSection>

        <Footer>
          <FooterGrid>
            <FooterBrandBlock>
              <FooterLogo src={imageUrls.logo} alt={content.brand.logoAlt} />
              <FooterBrandText>
                <strong>{content.brand.name}</strong>
                <span>{content.footer.brandTagline}</span>
              </FooterBrandText>
            </FooterBrandBlock>

            <FooterColumn>
              <FooterHeading>{content.footer.exploreHeading}</FooterHeading>
              {navItems.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn>
              <FooterHeading>{content.footer.contactHeading}</FooterHeading>
              <FooterEmail href={`mailto:${content.contact.email}`}>
                {content.contact.email}
              </FooterEmail>
              <FooterPhone href={`tel:${content.footer.phone.replace(/\D/g, "")}`}>
                {content.footer.phone}
              </FooterPhone>
              <FooterSocials>
                <SocialLinks
                  links={socialLinks}
                  ariaLabel={content.ui.socialAriaLabel}
                />
              </FooterSocials>
            </FooterColumn>
          </FooterGrid>

          <Copyright>
            <span>{content.footer.copyright}</span>
            <span>
              {content.footer.poweredByPrefix}{" "}
              <a
                href={content.footer.poweredByHref}
                target="_blank"
                rel="noreferrer"
              >
                {content.footer.poweredByName}
              </a>
            </span>
          </Copyright>
        </Footer>
      </Page>
    </>
  );
}

const PURPLE = "#281035";
const PLUM = "#3d1856";
const DEEP_PLUM = "#18091f";
const GOLD = "#c99a3d";
const GOLD_LIGHT = "#f3d88b";
const CREAM = "#fff7ea";
const BLUSH = "#f8e4df";
const WHITE = "#ffffff";
const INK = "#170d1d";
const MUTED = "rgba(23, 13, 29, 0.72)";

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    margin: 0;
    min-height: 100%;
    background: ${CREAM};
    color: ${INK};
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    scroll-behavior: smooth;
  }

  * {
    box-sizing: border-box;
  }

  a {
    color: inherit;
  }

  img {
    max-width: 100%;
    display: block;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  section {
    scroll-margin-top: 96px;
  }
`;

const Page = styled.main`
  min-height: 100vh;
  background: radial-gradient(
      circle at top left,
      rgba(201, 154, 61, 0.16),
      transparent 34rem
    ),
    linear-gradient(180deg, ${CREAM} 0%, #fffaf2 45%, #f8efe7 100%);
`;

const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 60;
  height: 78px;
  padding: 0 56px;
  background: rgba(255, 247, 234, 0.92);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(201, 154, 61, 0.24);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 800px) {
    padding: 0 20px;
  }
`;

const Brand = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
`;

const Logo = styled.img`
  width: 54px;
  height: 54px;
  object-fit: contain;

  @media (max-width: 520px) {
    width: 46px;
    height: 46px;
  }
`;

const BrandText = styled.div`
  display: grid;
  line-height: 1.1;

  strong {
    color: ${PURPLE};
    font-family: Georgia, "Times New Roman", serif;
    font-size: 1.2rem;
  }

  span {
    color: ${GOLD};
    font-size: 0.76rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 800;
  }

  @media (max-width: 520px) {
    strong {
      font-size: 1rem;
    }

    span {
      display: none;
    }
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 22px;

  a {
    color: ${PURPLE};
    text-decoration: none;
    font-size: 0.86rem;
    font-weight: 800;
  }

  a:hover {
    color: ${GOLD};
  }

  @media (max-width: 920px) {
    display: none;
  }
`;

const DesktopNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 22px;

  @media (max-width: 920px) {
    display: none;
  }
`;

const SocialList = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
`;

const SocialLink = styled.a`
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  color: ${PURPLE};
  background: ${WHITE};
  border: 1px solid rgba(201, 154, 61, 0.42);
  border-radius: 50%;
  transition: color 0.2s ease, background 0.2s ease, transform 0.2s ease;

  svg {
    width: 19px;
    height: 19px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  svg .fill,
  svg.solid path {
    fill: currentColor;
    stroke: none;
  }

  &:hover {
    color: ${WHITE};
    background: ${PLUM};
    transform: translateY(-2px);
  }
`;

const MenuButton = styled.button<{ $open: boolean }>`
  display: none;
  width: 46px;
  height: 46px;
  border: 1px solid rgba(201, 154, 61, 0.42);
  border-radius: 14px;
  background: ${WHITE};
  cursor: pointer;
  place-items: center;
  padding: 11px;

  span {
    display: block;
    width: 22px;
    height: 2px;
    background: ${PURPLE};
    border-radius: 999px;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  span:nth-child(1) {
    transform: ${({ $open }) =>
      $open ? "translateY(7px) rotate(45deg)" : "none"};
  }

  span:nth-child(2) {
    opacity: ${({ $open }) => ($open ? 0 : 1)};
  }

  span:nth-child(3) {
    transform: ${({ $open }) =>
      $open ? "translateY(-7px) rotate(-45deg)" : "none"};
  }

  @media (max-width: 920px) {
    display: grid;
  }
`;

const MobileMenu = styled.div<{ $open: boolean }>`
  display: none;

  @media (max-width: 920px) {
    position: sticky;
    top: 78px;
    z-index: 55;
    display: grid;
    max-height: ${({ $open }) => ($open ? "540px" : "0")};
    overflow: hidden;
    opacity: ${({ $open }) => ($open ? 1 : 0)};
    background: rgba(255, 247, 234, 0.98);
    backdrop-filter: blur(18px);
    border-bottom: ${({ $open }) =>
      $open ? "1px solid rgba(201, 154, 61, 0.26)" : "0 solid transparent"};
    box-shadow: ${({ $open }) =>
      $open ? "0 24px 50px rgba(40, 16, 53, 0.12)" : "none"};
    transition: max-height 0.26s ease, opacity 0.2s ease,
      border-bottom 0.2s ease;
  }
`;

const MobileSocials = styled.div`
  padding: 18px 24px 22px;
  border-top: 1px solid rgba(201, 154, 61, 0.18);
`;

const MobileMenuLink = styled.a`
  padding: 18px 24px;
  color: ${PURPLE};
  text-decoration: none;
  font-weight: 900;
  border-top: 1px solid rgba(201, 154, 61, 0.18);

  &:hover {
    background: rgba(201, 154, 61, 0.12);
    color: ${GOLD};
  }
`;

const Hero = styled(motion.section)`
  position: relative;
  overflow: hidden;
`;

const HeroGlow = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(
      circle at 85% 20%,
      rgba(201, 154, 61, 0.26),
      transparent 28rem
    ),
    radial-gradient(circle at 10% 80%, rgba(61, 24, 86, 0.12), transparent 24rem);
`;

const HeroInner = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto;
  padding: 92px 24px 96px;
  display: grid;
  grid-template-columns: 0.92fr 1.08fr;
  gap: 64px;
  align-items: center;

  @media (max-width: 940px) {
    grid-template-columns: 1fr;
    padding-top: 64px;
  }
`;

const HeroCopy = styled(motion.div)``;

const Pill = styled.div`
  display: inline-flex;
  padding: 10px 16px;
  border: 1px solid rgba(201, 154, 61, 0.45);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.64);
  color: ${PURPLE};
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-weight: 900;
  margin-bottom: 28px;
`;

const HeroTitle = styled.h1`
  margin: 0;
  color: ${PURPLE};
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(3.4rem, 7vw, 6.7rem);
  line-height: 0.92;
  letter-spacing: -0.07em;
`;

const HeroText = styled.p`
  max-width: 570px;
  margin: 30px 0 0;
  color: ${MUTED};
  font-size: 1.15rem;
  line-height: 1.8;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 34px;
`;

const Button = styled.a`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 52px;
  padding: 14px 26px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 900;
  transition: 0.2s ease;
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%);
  color: ${DEEP_PLUM};
  box-shadow: 0 18px 42px rgba(201, 154, 61, 0.28);

  &:hover {
    transform: translateY(-2px);
  }
`;

const SecondaryButton = styled(Button)`
  background: ${WHITE};
  color: ${PURPLE};
  border: 1px solid rgba(201, 154, 61, 0.55);

  &:hover {
    border-color: ${PURPLE};
    transform: translateY(-2px);
  }
`;

const HeroImageWrap = styled(motion.div)`
  border-radius: 34px;
  padding: 12px;
  background: linear-gradient(
    135deg,
    rgba(201, 154, 61, 0.62),
    rgba(61, 24, 86, 0.82)
  );
  box-shadow: 0 34px 90px rgba(40, 16, 53, 0.28);
`;

const HeroImage = styled.img`
  width: 100%;
  max-height: 740px;
  object-fit: cover;
  object-position: center top;
  border-radius: 24px;
`;

const StatementBar = styled(motion.section)`
  background: ${PURPLE};
  color: ${WHITE};
  border-top: 3px solid ${GOLD};
  border-bottom: 3px solid ${GOLD};
  padding: 28px 24px;
`;

const StatementInner = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 6px;
  text-align: center;

  strong {
    color: ${GOLD_LIGHT};
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(1.8rem, 3vw, 3rem);
  }

  span {
    color: rgba(255, 255, 255, 0.82);
    font-size: 1rem;
  }
`;

const BookSection = styled(motion.section)`
  padding: 104px 24px;
`;

const CenteredHeader = styled(motion.div)`
  max-width: 820px;
  margin: 0 auto 56px;
  text-align: center;
`;

const Eyebrow = styled(motion.div)`
  color: ${GOLD};
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.74rem;
  font-weight: 900;
  margin-bottom: 16px;
`;

const SectionTitle = styled(motion.h2)`
  margin: 0;
  color: ${PURPLE};
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2.35rem, 5vw, 4.4rem);
  line-height: 1.02;
  letter-spacing: -0.055em;
`;

const SectionText = styled.p`
  max-width: 720px;
  margin: 22px auto 0;
  color: ${MUTED};
  font-size: 1.05rem;
  line-height: 1.75;
`;

const BookGrid = styled(motion.div)`
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const BookCard = styled(motion.article)`
  overflow: hidden;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(201, 154, 61, 0.32);
  box-shadow: 0 22px 70px rgba(40, 16, 53, 0.09);
  display: flex;
  flex-direction: column;
`;

const BookImageFrame = styled(motion.a)`
  height: clamp(340px, 32vw, 430px);
  background: radial-gradient(
      circle at center,
      rgba(201, 154, 61, 0.22),
      transparent 65%
    ),
    linear-gradient(180deg, #fff7ef, ${BLUSH});
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 34px;
  border-bottom: 1px solid rgba(201, 154, 61, 0.22);
  overflow: hidden;
  text-decoration: none;
  cursor: pointer;

  @media (max-width: 980px) {
    height: 410px;
  }

  @media (max-width: 520px) {
    height: 350px;
    padding: 28px;
  }
`;

const BookImage = styled(motion.img)`
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
`;

const BookContent = styled.div`
  padding: 26px;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const BookBadge = styled.div`
  width: fit-content;
  margin-bottom: 16px;
  padding: 8px 12px;
  border-radius: 999px;
  background: ${PURPLE};
  color: ${GOLD_LIGHT};
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 900;
`;

const BookTitle = styled.h3`
  margin: 0;
  color: ${PURPLE};
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.55rem;
  line-height: 1.1;
`;

const BookSubtitle = styled.p`
  margin: 12px 0 0;
  color: ${GOLD};
  font-weight: 900;
  line-height: 1.45;
`;

const BookDescription = styled.p`
  margin: 16px 0 0;
  color: ${MUTED};
  line-height: 1.7;
  flex: 1;
`;

const BookButton = styled(PrimaryButton)`
  margin-top: 22px;
  width: 100%;
`;

const TestimonialSection = styled(motion.section)`
  padding: 104px 24px;
  background: linear-gradient(180deg, #fffaf2 0%, ${CREAM} 100%);
`;

const TestimonialInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
`;

const TestimonialHeader = styled(motion.div)`
  max-width: 760px;
  margin: 0 auto 46px;
  text-align: center;
`;

const MainTestimonialCard = styled(motion.article)`
  position: relative;
  padding: clamp(34px, 6vw, 64px);
  border-radius: 34px;
  background: linear-gradient(135deg, ${PURPLE}, ${DEEP_PLUM});
  border: 1px solid rgba(201, 154, 61, 0.42);
  box-shadow: 0 30px 90px rgba(40, 16, 53, 0.18);
  overflow: hidden;

  &::after {
    content: "“";
    position: absolute;
    right: 34px;
    top: -24px;
    color: rgba(243, 216, 139, 0.16);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 13rem;
    line-height: 1;
  }
`;

const TestimonialLabel = styled.div`
  position: relative;
  z-index: 1;
  width: fit-content;
  margin-bottom: 26px;
  padding: 9px 13px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: ${GOLD_LIGHT};
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-weight: 900;
`;

const MainQuote = styled.blockquote`
  position: relative;
  z-index: 1;
  margin: 0;
  color: ${WHITE};
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.7rem, 4vw, 3.4rem);
  line-height: 1.16;
  letter-spacing: -0.035em;
`;

const TestimonialAuthor = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 30px;
  display: grid;
  gap: 4px;

  strong {
    color: ${GOLD_LIGHT};
    font-size: 1rem;
  }

  span {
    color: rgba(255, 255, 255, 0.74);
    font-size: 0.92rem;
  }
`;

const SupportingTestimonialGrid = styled.div`
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const SmallTestimonialCard = styled(motion.article)`
  padding: 28px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(201, 154, 61, 0.32);

  ${TestimonialAuthor} {
    strong {
      color: ${PURPLE};
    }

    span {
      color: ${MUTED};
    }
  }
`;

const SmallQuote = styled.blockquote`
  margin: 0;
  color: ${MUTED};
  font-size: 1.05rem;
  line-height: 1.75;
`;

const About = styled(motion.section)`
  max-width: 1180px;
  margin: 0 auto;
  padding: 104px 24px;
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 64px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const AboutImageWrap = styled(motion.div)`
  position: sticky;
  top: 110px;
  max-width: 390px;
  margin: 0 auto;
  border-radius: 999px 999px 32px 32px;
  overflow: hidden;
  border: 4px solid ${GOLD};
  box-shadow: 0 28px 80px rgba(40, 16, 53, 0.2);
  background: ${BLUSH};

  @media (max-width: 980px) {
    position: relative;
    top: auto;
  }
`;

const AboutImage = styled.img`
  width: 100%;
  object-fit: cover;
`;

const AboutContent = styled.div`
  padding: 42px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(201, 154, 61, 0.34);
  box-shadow: 0 24px 80px rgba(40, 16, 53, 0.08);

  @media (max-width: 640px) {
    padding: 30px 24px;
  }
`;

const BioLead = styled(motion.p)`
  margin: 28px 0 0;
  color: ${PURPLE};
  font-size: 1.2rem;
  line-height: 1.7;
  font-weight: 700;
`;

const BioText = styled(motion.p)`
  color: ${MUTED};
  line-height: 1.85;
  font-size: 1.04rem;
`;

const BioHighlights = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin: 30px 0;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const BioHighlightCard = styled(motion.div)`
  padding: 22px;
  border-radius: 22px;
  background: radial-gradient(
      circle at top right,
      rgba(201, 154, 61, 0.16),
      transparent 10rem
    ),
    rgba(255, 247, 234, 0.76);
  border: 1px solid rgba(201, 154, 61, 0.28);
`;

const BioCardLabel = styled.div`
  margin-bottom: 10px;
  color: ${GOLD};
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-weight: 900;
`;

const BioCardText = styled.p`
  margin: 0;
  color: ${MUTED};
  line-height: 1.65;

  strong {
    color: ${PURPLE};
  }
`;

const MissionCard = styled(motion.div)`
  position: relative;
  margin: 32px 0;
  padding: 34px 34px 34px 82px;
  border-radius: 28px;
  background: linear-gradient(135deg, ${PURPLE}, ${PLUM});
  color: ${WHITE};
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    right: -80px;
    top: -80px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: rgba(201, 154, 61, 0.18);
  }

  @media (max-width: 640px) {
    padding: 34px;
  }
`;

const QuoteMark = styled.div`
  position: absolute;
  left: 28px;
  top: 22px;
  color: ${GOLD_LIGHT};
  font-family: Georgia, "Times New Roman", serif;
  font-size: 4.5rem;
  line-height: 1;

  @media (max-width: 640px) {
    position: static;
    margin-bottom: 8px;
  }
`;

const MissionText = styled.p`
  position: relative;
  z-index: 1;
  margin: 0;
  color: rgba(255, 255, 255, 0.88);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  line-height: 1.2;
`;

const BioMission = styled(motion.p)`
  margin: 30px 0 0;
  padding: 20px 22px;
  border-left: 5px solid ${GOLD};
  background: rgba(201, 154, 61, 0.12);
  color: ${PURPLE};
  font-size: 1.14rem;
  line-height: 1.7;
  font-weight: 800;
`;

const Signature = styled(motion.div)`
  margin-top: 26px;
  color: ${GOLD};
  font-size: 2.2rem;
  font-family: "Brush Script MT", "Segoe Script", cursive;
`;

const Newsletter = styled(motion.section)`
  padding: 64px 24px;
  background: radial-gradient(
      circle at right,
      rgba(201, 154, 61, 0.22),
      transparent 24rem
    ),
    ${BLUSH};
  border-top: 1px solid rgba(201, 154, 61, 0.34);
  border-bottom: 1px solid rgba(201, 154, 61, 0.24);
`;

const NewsletterInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 42px;
  align-items: center;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const NewsletterTitle = styled(motion.h2)`
  margin: 0;
  color: ${PURPLE};
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2rem, 4vw, 3.3rem);
  line-height: 1.06;
`;

const NewsletterForm = styled(motion.form)`
  display: flex;
  gap: 14px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  border: 1px solid rgba(201, 154, 61, 0.38);
  background: ${WHITE};
  border-radius: 999px;
  padding: 16px 20px;
  color: ${PURPLE};
`;

const SubscribeButton = styled.button`
  border: 0;
  border-radius: 999px;
  padding: 16px 26px;
  background: ${PURPLE};
  color: ${WHITE};
  font-weight: 900;
  cursor: pointer;

  &:hover {
    background: ${PLUM};
  }

  &:disabled {
    cursor: wait;
    opacity: 0.72;
  }
`;

const FAQSection = styled(motion.section)`
  padding: 104px 24px;
  background: linear-gradient(180deg, ${CREAM} 0%, #fffaf2 72%, ${BLUSH} 100%);
`;

const FAQInner = styled.div`
  max-width: 960px;
  margin: 0 auto;
`;

const FAQHeader = styled(motion.div)`
  max-width: 820px;
  margin: 0 auto 46px;
  text-align: center;
`;

const FAQList = styled(motion.div)`
  display: grid;
  gap: 16px;
`;

const FAQItemCard = styled(motion.article)`
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(201, 154, 61, 0.32);
  box-shadow: 0 18px 54px rgba(40, 16, 53, 0.07);
  overflow: hidden;
`;

const FAQQuestion = styled.button`
  width: 100%;
  border: 0;
  padding: 24px 26px;
  background: transparent;
  color: ${PURPLE};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  text-align: left;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.15rem, 2vw, 1.45rem);
  font-weight: 800;

  &:hover {
    color: ${GOLD};
  }
`;

const FAQIcon = styled(motion.span)`
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(201, 154, 61, 0.14);
  color: ${PURPLE};
  font-family: Inter, system-ui, sans-serif;
  font-size: 1.4rem;
  line-height: 1;
`;

const FAQAnswerWrap = styled(motion.div)`
  overflow: hidden;
`;

const FAQAnswer = styled.div`
  padding: 0 26px 26px;
  color: ${MUTED};
  line-height: 1.8;
  font-size: 1rem;

  p {
    margin: 0;
  }
`;

const FAQCta = styled.a`
  display: inline-flex;
  margin-top: 16px;
  color: ${PLUM};
  font-weight: 900;
  text-decoration-color: ${GOLD};
  text-underline-offset: 4px;

  &:hover {
    color: ${GOLD};
  }
`;

const SpeakingCtaSection = styled(motion.section)`
  padding: 104px 24px;
  background: linear-gradient(135deg, ${PURPLE}, ${DEEP_PLUM});
  color: ${WHITE};
`;

const SpeakingCtaGrid = styled.div`
  max-width: 1160px;
  margin: 0 auto;
`;

const SpeakingIntro = styled(motion.div)`
  max-width: 900px;
  margin: 0 auto 56px;
  text-align: center;

  ${SectionTitle} {
    color: ${WHITE};
  }

  ${SectionText} {
    color: rgba(255, 255, 255, 0.82);
  }
`;

const SpeakingContentRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 54px;
  align-items: center;

  @media (max-width: 940px) {
    grid-template-columns: 1fr;
  }
`;

const SpeakingImageWrap = styled(motion.div)`
  max-width: 620px;
  margin: 0 auto;
`;

const SpeakingImage = styled.img`
  width: 100%;
  max-height: 620px;
  object-fit: contain;
`;

const SpeakingServiceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
`;

const SpeakingServiceCard = styled(motion.article)`
  position: relative;
  padding: 20px 20px 20px 52px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(201, 154, 61, 0.26);

  &::before {
    content: "✦";
    position: absolute;
    left: 20px;
    top: 20px;
    color: ${GOLD_LIGHT};
  }
`;

const ServiceTitle = styled.h3`
  margin: 0;
  color: ${WHITE};
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.25rem;
`;

const ServiceText = styled.p`
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.7;
  font-size: 0.95rem;
`;

const CtaCard = styled(motion.div)`
  margin-top: 42px;
  padding: 30px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(201, 154, 61, 0.26);

  ${SecondaryButton} {
    background: rgba(255, 255, 255, 0.08);
    color: ${WHITE};
  }
`;

const CtaText = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.86);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.4rem, 3vw, 2.15rem);
  line-height: 1.2;
`;

const ContactSection = styled(motion.section)`
  padding: 104px 24px;
  background: radial-gradient(
      circle at 12% 12%,
      rgba(201, 154, 61, 0.18),
      transparent 22rem
    ),
    linear-gradient(180deg, ${BLUSH} 0%, ${CREAM} 100%);
  border-top: 1px solid rgba(201, 154, 61, 0.32);
`;

const ContactGrid = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 0.86fr 1.14fr;
  gap: 54px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const ContactIntro = styled(motion.div)`
  position: sticky;
  top: 110px;

  @media (max-width: 980px) {
    position: relative;
    top: auto;
  }
`;

const ContactText = styled.p`
  color: ${MUTED};
  line-height: 1.8;
  font-size: 1.06rem;
`;

const ContactEmail = styled.a`
  display: inline-flex;
  margin-top: 8px;
  color: ${PLUM};
  font-weight: 900;
  text-decoration-color: ${GOLD};
  text-underline-offset: 4px;

  &:hover {
    color: ${GOLD};
  }
`;

const ContactForm = styled(motion.form)`
  padding: 34px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(201, 154, 61, 0.34);
  box-shadow: 0 24px 80px rgba(40, 16, 53, 0.08);

  @media (max-width: 640px) {
    padding: 26px 20px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: grid;
  gap: 8px;
`;

const FullField = styled(Field)`
  grid-column: 1 / -1;
`;

const Label = styled.label`
  color: ${PURPLE};
  font-size: 0.82rem;
  font-weight: 900;
`;

const formFieldStyles = `
  width: 100%;
  border: 1px solid rgba(201, 154, 61, 0.38);
  background: ${WHITE};
  border-radius: 18px;
  padding: 15px 16px;
  color: ${PURPLE};
  outline: none;

  &:focus {
    border-color: ${GOLD};
    box-shadow: 0 0 0 4px rgba(201, 154, 61, 0.14);
  }

  &::placeholder {
    color: rgba(40, 16, 53, 0.46);
  }
`;

const TextInput = styled.input`
  ${formFieldStyles}
`;

const SelectInput = styled.select`
  ${formFieldStyles}
`;

const TextArea = styled.textarea`
  ${formFieldStyles}
  min-height: 150px;
  resize: vertical;
`;

const SubmitButton = styled.button`
  margin-top: 24px;
  width: 100%;
  border: 0;
  border-radius: 999px;
  padding: 16px 26px;
  background: linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%);
  color: ${DEEP_PLUM};
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 18px 42px rgba(201, 154, 61, 0.24);

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.72;
    transform: none;
  }
`;

const Footer = styled.footer`
  background: ${DEEP_PLUM};
  color: ${WHITE};
  padding: 64px 24px 28px;
  border-top: 3px solid ${GOLD};
`;

const FooterGrid = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 54px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const FooterBrandBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const FooterLogo = styled.img`
  width: 82px;
  height: 82px;
  object-fit: contain;
`;

const FooterBrandText = styled.div`
  display: grid;

  strong {
    color: ${GOLD_LIGHT};
    font-family: Georgia, "Times New Roman", serif;
    font-size: 1.6rem;
  }

  span {
    color: rgba(255, 255, 255, 0.76);
  }
`;

const FooterColumn = styled.div``;

const FooterHeading = styled.h4`
  margin: 0 0 18px;
  color: ${GOLD_LIGHT};
`;

const FooterLink = styled.a`
  display: block;
  color: rgba(255, 255, 255, 0.76);
  text-decoration: none;
  margin-bottom: 10px;

  &:hover {
    color: ${GOLD_LIGHT};
  }
`;

const FooterEmail = styled.a`
  display: inline-block;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.76);
  text-decoration-color: ${GOLD};
  text-underline-offset: 4px;

  &:hover {
    color: ${GOLD_LIGHT};
  }
`;

const FooterPhone = styled.a`
  display: block;
  width: fit-content;
  margin-bottom: 18px;
  color: rgba(255, 255, 255, 0.76);
  text-decoration-color: ${GOLD};
  text-underline-offset: 4px;

  &:hover {
    color: ${GOLD_LIGHT};
  }
`;

const FooterSocials = styled.div`
  a {
    color: ${GOLD_LIGHT};
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(243, 216, 139, 0.42);
  }

  a:hover {
    color: ${DEEP_PLUM};
    background: ${GOLD_LIGHT};
  }
`;

const Copyright = styled.div`
  max-width: 1120px;
  margin: 46px auto 0;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  text-align: center;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.88rem;
  display: grid;
  gap: 8px;

  a {
    color: ${GOLD_LIGHT};
  }
`;
