import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { HARDCODED_PRODUCTS } from "@/lib/hardcoded-products";
import { prisma } from "@/lib/prisma";

// Refresh the generated sitemap hourly.
export const revalidate = 3600;

// Static routes that always exist, with relative importance / change cadence.
const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/products", changeFrequency: "weekly", priority: 0.9 },
  { path: "/khoa-hoc-banh-mi-sai-gon", changeFrequency: "monthly", priority: 0.9 },
  { path: "/story", changeFrequency: "monthly", priority: 0.8 },
  { path: "/culinary-consultation", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "daily", priority: 0.7 },
  { path: "/events", changeFrequency: "weekly", priority: 0.6 },
  { path: "/preorderBLTM", changeFrequency: "weekly", priority: 0.7 },
  { path: "/workshop_booking1-1", changeFrequency: "monthly", priority: 0.6 },
  { path: "/landing/salted-egg-sponge-cake", changeFrequency: "monthly", priority: 0.6 },
  { path: "/landing/vietnamese-food-mastery", changeFrequency: "monthly", priority: 0.6 },
  { path: "/landing/milk-tea-program", changeFrequency: "monthly", priority: 0.6 },
  { path: "/landing/premium-recipe-consultation", changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Product detail pages — hardcoded slugs always; DB slugs when reachable.
  const productSlugs = new Map<string, Date>();
  for (const p of HARDCODED_PRODUCTS) productSlugs.set(p.slug, now);
  try {
    const dbProducts = await prisma.product.findMany({
      where: { available: true },
      select: { slug: true, updatedAt: true },
    });
    for (const p of dbProducts) productSlugs.set(p.slug, p.updatedAt ?? now);
  } catch {
    // DB unreachable — hardcoded products still ship in the sitemap.
  }
  const productEntries: MetadataRoute.Sitemap = Array.from(
    productSlugs.entries()
  ).map(([slug, lastModified]) => ({
    url: absoluteUrl(`/products/${slug}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Published blog posts (best effort).
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, publishedAt: true, updatedAt: true },
    });
    blogEntries = posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt ?? post.publishedAt ?? now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    // No DB — skip dynamic blog entries.
  }

  return [...staticEntries, ...productEntries, ...blogEntries];
}
