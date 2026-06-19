import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, BRAND, absoluteUrl, pageMetadata } from "@/lib/seo";

const PATH = "/landing/premium-recipe-consultation";
const TITLE = "Premium 1-1 Recipe Consultation";
const DESCRIPTION =
  "Exclusive 1-to-1 recipe consultation with Bonu — recipes tested and optimised for local UK ingredients, with a first-time-success guarantee. Tư vấn công thức độc quyền 1-1 cho nhà hàng của bạn.";

export const metadata: Metadata = pageMetadata({
  path: PATH,
  title: TITLE,
  description: DESCRIPTION,
});

export default function PremiumRecipeConsultationLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Recipe consultation",
          name: TITLE,
          description: DESCRIPTION,
          url: absoluteUrl(PATH),
          areaServed: "GB",
          provider: { "@type": "Organization", name: BRAND.name, url: SITE_URL },
        }}
      />
      {children}
    </>
  );
}
