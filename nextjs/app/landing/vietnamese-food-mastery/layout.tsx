import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, BRAND, absoluteUrl, pageMetadata } from "@/lib/seo";

const PATH = "/landing/vietnamese-food-mastery";
const TITLE = "Vietnamese Food Mastery — Recipe & Operations Programme";
const DESCRIPTION =
  "A tailored Vietnamese Food Mastery programme: proven, sellable recipes plus the operational mindset to run a profitable kitchen in the UK. Mastery Món Việt — công thức chuẩn & tư duy vận hành F&B.";

export const metadata: Metadata = pageMetadata({
  path: PATH,
  title: TITLE,
  description: DESCRIPTION,
});

export default function VietnameseFoodMasteryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: TITLE,
          description: DESCRIPTION,
          url: absoluteUrl(PATH),
          inLanguage: ["vi", "en-GB"],
          provider: { "@type": "Organization", name: BRAND.name, url: SITE_URL },
        }}
      />
      {children}
    </>
  );
}
