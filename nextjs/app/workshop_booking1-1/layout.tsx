import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/workshop_booking1-1",
  title: "Book a 1-1 Bánh Mì Masterclass",
  description:
    "Book a private 1-to-1 Sài Gòn bánh mì masterclass with Bonu — learn fillings, pâté, sauces, pricing and operations to start your own street-food business in the UK. Đặt lịch học bánh mì 1-1.",
});

export default function WorkshopBooking11Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
