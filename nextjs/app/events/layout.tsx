import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/events",
  title: "Events & Pop-Ups",
  description:
    "Catch Bonu Cakes at upcoming pop-ups, markets and tasting events across the UK — Vietnamese bánh mì, bubble tea and cakes. Lịch sự kiện & pop-up của Bonu.",
});

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
