import type { Metadata } from "next";
import { cache } from "react";
import JsonLd from "@/components/JsonLd";
import { HARDCODED_PRODUCTS } from "@/lib/hardcoded-products";
import { prisma } from "@/lib/prisma";
import { SITE_URL, BRAND, DEFAULT_OG_IMAGE, absoluteUrl, languageAlternates } from "@/lib/seo";

interface ProductSeo {
  slug: string;
  name: string;
  description: string;
  image: string;
  price?: string;
  available: boolean;
}

// Fetch once per request, shared by generateMetadata and the layout component.
const getProduct = cache(async (slug: string): Promise<ProductSeo | null> => {
  const hardcoded = HARDCODED_PRODUCTS.find((p) => p.slug === slug);
  if (hardcoded) {
    return {
      slug,
      name: hardcoded.nameEn,
      description:
        hardcoded.shortDescriptionEn || hardcoded.descriptionEn || "",
      image: hardcoded.images?.[0] ? absoluteUrl(hardcoded.images[0]) : DEFAULT_OG_IMAGE.url,
      price: hardcoded.price,
      available: hardcoded.available,
    };
  }

  try {
    const p = await prisma.product.findUnique({ where: { slug } });
    if (!p) return null;
    const images = Array.isArray((p as any).images) ? ((p as any).images as string[]) : [];
    const firstImage = images[0] || (p as any).imageSrc;
    return {
      slug,
      name: (p as any).nameEn || (p as any).nameVi || slug,
      description:
        (p as any).shortDescriptionEn || (p as any).descriptionEn || "",
      image: firstImage ? absoluteUrl(firstImage) : DEFAULT_OG_IMAGE.url,
      price: (p as any).price ? String((p as any).price) : undefined,
      available: Boolean((p as any).available),
    };
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  const path = `/products/${params.slug}`;

  if (!product) {
    return {
      title: "Product",
      alternates: languageAlternates(path),
    };
  }

  const description = (product.description || `${product.name} — ${BRAND.taglineEn}.`).slice(0, 200);

  return {
    title: product.name,
    description,
    alternates: languageAlternates(path),
    openGraph: {
      type: "website",
      siteName: BRAND.name,
      url: absoluteUrl(path),
      title: `${product.name} | ${BRAND.name}`,
      description,
      locale: "en_GB",
      alternateLocale: ["vi_VN"],
      images: [{ url: product.image, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${BRAND.name}`,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);

  return (
    <>
      {product && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.image,
            url: absoluteUrl(`/products/${product.slug}`),
            brand: { "@type": "Brand", name: BRAND.name },
            ...(product.price
              ? {
                  offers: {
                    "@type": "Offer",
                    price: product.price,
                    priceCurrency: "GBP",
                    availability: product.available
                      ? "https://schema.org/InStock"
                      : "https://schema.org/PreOrder",
                    url: absoluteUrl(`/products/${product.slug}`),
                    seller: { "@type": "Organization", name: BRAND.name, url: SITE_URL },
                  },
                }
              : {}),
          }}
        />
      )}
      {children}
    </>
  );
}
