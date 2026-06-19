import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/preorderBLTM",
  title: "Pre-Order Salted Egg Sponge Cake (Bánh Bông Lan Trứng Muối)",
  description:
    "Pre-order Bonu's signature salted-egg sponge cake — soft melt-in-mouth sponge, roasted salted egg, homemade pork floss and 4 special sauces. Đặt trước bánh bông lan trứng muối nhà Bonu.",
});

export default function PreorderBltmLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
