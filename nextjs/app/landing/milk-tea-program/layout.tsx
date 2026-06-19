import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, BRAND, absoluteUrl, pageMetadata } from "@/lib/seo";

const PATH = "/landing/milk-tea-program";
const TITLE = "Milk Tea Signature Programme";
const DESCRIPTION =
  "Bonu's exclusive milk tea / bubble tea signature programme — signature recipes (including salted-egg milk tea), costing and operations to launch a bubble tea menu that sells. Chương trình trà sữa độc quyền.";

export const metadata: Metadata = pageMetadata({
  path: PATH,
  title: TITLE,
  description: DESCRIPTION,
});

export default function MilkTeaProgramLayout({ children }: { children: React.ReactNode }) {
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
