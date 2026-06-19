import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/landing/salted-egg-sponge-cake",
  title: "Salted Egg Sponge Cake — Signature Combo & Recipe Programme",
  description:
    "Bonu's signature salted-egg sponge cake combo and the stable, sellable recipe programme behind it — optimised for moisture so it stays soft even chilled. Combo & công thức bánh bông lan trứng muối chuẩn bán.",
});

export default function SaltedEggLandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
