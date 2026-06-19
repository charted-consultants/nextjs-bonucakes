import type { Metadata } from "next";
import { cache } from "react";
import JsonLd from "@/components/JsonLd";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { prisma } from "@/lib/prisma";
import { SITE_URL, BRAND, DEFAULT_OG_IMAGE, absoluteUrl, languageAlternates } from "@/lib/seo";

interface PostSeo {
  slug: string;
  title: string;
  description: string;
  image: string;
  author: string;
  publishedAt?: string;
  modifiedAt?: string;
}

const getPost = cache(async (slug: string): Promise<PostSeo | null> => {
  const stat = BLOG_POSTS[slug];
  if (stat) {
    return {
      slug,
      title: stat.titleEn || stat.title,
      description: stat.excerptEn || stat.excerpt || "",
      image: stat.image ? absoluteUrl(stat.image) : DEFAULT_OG_IMAGE.url,
      author: stat.author || BRAND.name,
      publishedAt: stat.date,
      modifiedAt: stat.date,
    };
  }

  try {
    const p: any = await prisma.blogPost.findUnique({ where: { slug } });
    if (!p) return null;
    return {
      slug,
      title: p.titleEn || p.titleVi || slug,
      description: p.excerptEn || p.excerptVi || "",
      image: p.image ? absoluteUrl(p.image) : DEFAULT_OG_IMAGE.url,
      author: p.author || BRAND.name,
      publishedAt: (p.publishedAt ?? p.createdAt)?.toISOString?.() ?? undefined,
      modifiedAt: (p.updatedAt ?? p.publishedAt)?.toISOString?.() ?? undefined,
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
  const post = await getPost(params.slug);
  const path = `/blog/${params.slug}`;

  if (!post) {
    return { title: "Blog", alternates: languageAlternates(path) };
  }

  const description = post.description.slice(0, 200);

  return {
    title: post.title,
    description,
    authors: [{ name: post.author }],
    alternates: languageAlternates(path),
    openGraph: {
      type: "article",
      siteName: BRAND.name,
      url: absoluteUrl(path),
      title: `${post.title} | ${BRAND.name}`,
      description,
      locale: "en_GB",
      alternateLocale: ["vi_VN"],
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt,
      authors: [post.author],
      images: [{ url: post.image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | ${BRAND.name}`,
      description,
      images: [post.image],
    },
  };
}

export default async function BlogPostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return (
    <>
      {post && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            image: post.image,
            datePublished: post.publishedAt,
            dateModified: post.modifiedAt || post.publishedAt,
            author: { "@type": "Person", name: post.author },
            publisher: {
              "@type": "Organization",
              name: BRAND.name,
              url: SITE_URL,
              logo: { "@type": "ImageObject", url: DEFAULT_OG_IMAGE.url },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": absoluteUrl(`/blog/${post.slug}`),
            },
          }}
        />
      )}
      {children}
    </>
  );
}
