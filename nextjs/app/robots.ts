import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep transactional / private routes out of the index.
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/cart",
          "/checkout",
          "/payment",
          "/order-success",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
