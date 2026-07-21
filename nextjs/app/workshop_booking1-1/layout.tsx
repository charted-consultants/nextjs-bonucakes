import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/workshop_booking1-1",
  title: "Book a 1-1 Bánh Mì Masterclass",
  description:
    "Book a private 1-to-1 Sài Gòn bánh mì masterclass with Bonu — learn fillings, pâté, sauces, pricing and operations to start your own street-food business in the UK. Đặt lịch học bánh mì 1-1.",
  image: {
    url: "https://bonucakes.com/images/workshop-cang-ban-cang-met-og.webp",
    width: 1200,
    height: 630,
    alt: "Workshop miễn phí Càng Bán Càng Mệt - Bonu Cakes",
  },
});

export default function WorkshopBooking11Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
