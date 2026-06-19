import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    path: "/story",
    title: "Our Story — 10+ Years Building Bonu F&B",
    description:
      "From selling cakes online to restaurants in central London and Manchester, and now Memoire Saigon in Wales — 10+ years building a Vietnamese F&B brand. Hành trình 10+ năm xây dựng thương hiệu F&B của Bonu.",
    ogType: "article",
    image: {
      url: "https://bonucakes.com/images/community-mindmap.webp",
      width: 1200,
      height: 630,
      alt: "Bonu F&B Journey",
    },
  }),
  authors: [{ name: "Uyen Nguyen - Bonu Cakes" }],
};

export default function StoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
