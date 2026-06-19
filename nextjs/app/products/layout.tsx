import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/products",
  title: "Shop — Vietnamese Cakes, Pork Floss & Bánh Mì",
  description:
    "Order Bonu Cakes' homemade Vietnamese specialities for UK delivery — salted-egg sponge cake (bánh bông lan trứng muối), traditional pork floss (chà bông) and more. Đặt bánh & đặc sản Việt giao tận nơi tại UK.",
});

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
