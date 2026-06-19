// Central SEO configuration for Bonu Cakes.
// One source of truth for the canonical domain, brand identity, contact /
// location details and the JSON-LD structured data we emit site-wide.
//
// ⚠️ VERIFY BEFORE PRODUCTION: the café address, phone and social handles
// below are the most consistent public signals we have. Correct anything
// that is out of date — wrong structured data hurts more than none.

export const SITE_URL = "https://bonucakes.com";

export const BRAND = {
  // Trading / display name used in titles and OG siteName.
  name: "Bonu Cakes",
  // Registered legal entity (Companies House).
  legalName: "BONU CAKES LTD",
  // Short bilingual taglines.
  taglineEn: "Vietnamese Bakery, Bubble Tea & Bánh Mì Courses",
  taglineVi: "Bánh, Trà Sữa & Khoá Học Bánh Mì Sài Gòn",
  email: "info@bonucakes.com",
  // Only handles we can verify. NOTE: instagram.com/bonucakes is NOT this
  // business — the real handle is bonu_bubbletea. Add TikTok once confirmed.
  social: [
    "https://www.facebook.com/profile.php?id=100009102362568",
    "https://www.instagram.com/bonu_bubbletea",
  ],
} as const;

// Default share image (1200×630). Replace with a branded OG image when ready.
export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/images/community-mindmap.webp`,
  width: 1200,
  height: 630,
  alt: "Bonu Cakes — Vietnamese bakery, bubble tea & bánh mì courses in the UK",
};

/** Resolve a path or absolute URL to an absolute URL on the canonical domain. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Build the per-page `alternates` block. With our single-URL bilingual setup
 * (client-side VI/EN toggle) each page has one canonical URL that serves both
 * languages, so vi / en / x-default all point at the same canonical.
 */
export function languageAlternates(path: string) {
  const url = absoluteUrl(path);
  return {
    canonical: url,
    languages: {
      "en-GB": url,
      vi: url,
      "x-default": url,
    },
  };
}

/**
 * Build a complete Metadata object for a static page (canonical + bilingual
 * alternates + Open Graph + Twitter), keeping per-page layouts to a few lines.
 */
export function pageMetadata(opts: {
  path: string;
  title: string;
  description: string;
  ogType?: "website" | "article";
  image?: { url: string; width: number; height: number; alt: string };
}) {
  const { path, title, description, ogType = "website" } = opts;
  const image = opts.image ?? DEFAULT_OG_IMAGE;
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: languageAlternates(path),
    openGraph: {
      type: ogType,
      siteName: BRAND.name,
      url,
      title: `${title} | ${BRAND.name}`,
      description,
      locale: "en_GB",
      alternateLocale: ["vi_VN"],
      images: [image],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${title} | ${BRAND.name}`,
      description,
      images: [image.url],
    },
  };
}

// ---------------------------------------------------------------------------
// JSON-LD structured data
// ---------------------------------------------------------------------------

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE.url,
    image: DEFAULT_OG_IMAGE.url,
    email: BRAND.email,
    description:
      "Vietnamese bakery serving Sài Gòn bánh mì, bubble tea and celebration cakes, and running professional bánh mì masterclasses for aspiring F&B entrepreneurs.",
    sameAs: [...BRAND.social],
  };
}

// NOTE: A LocalBusiness / FoodEstablishment schema (with a verified street
// address) would strengthen local search. Re-add it here once the correct
// storefront address is confirmed — do not guess the address.

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: BRAND.name,
    inLanguage: ["en-GB", "vi"],
    publisher: { "@id": ORGANIZATION_ID },
  };
}
