import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/blog",
  title: "Blog — F&B Lessons & Vietnamese Food Stories",
  description:
    "Real lessons from 10+ years in F&B: building an authentic Vietnamese food brand, running a profitable kitchen, and the story behind Best Bánh Mì in Manchester.",
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
