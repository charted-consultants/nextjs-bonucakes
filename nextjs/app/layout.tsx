import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import JsonLd from "@/components/JsonLd";
import {
  SITE_URL,
  BRAND,
  DEFAULT_OG_IMAGE,
  languageAlternates,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

const nunitoSans = Nunito_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-nunito-sans",
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Bonu Cakes | Vietnamese Bakery, Bubble Tea & Bánh Mì — UK",
    template: "%s | Bonu Cakes",
  },
  description:
    "Bonu Cakes is a Vietnamese bakery — homemade Sài Gòn bánh mì, salted-egg bubble tea and celebration cakes for UK delivery, plus professional bánh mì masterclasses. Bánh, trà sữa & khoá học bánh mì Sài Gòn tại UK.",
  keywords: [
    "Bonu Cakes",
    "Vietnamese bakery UK",
    "banh mi UK",
    "bubble tea UK",
    "Vietnamese food UK",
    "salted egg bubble tea",
    "Vietnamese celebration cakes",
    "banh mi course",
    "khoá học bánh mì Sài Gòn",
    "bánh bông lan trứng muối",
    "chà bông heo",
  ],
  applicationName: BRAND.name,
  authors: [{ name: BRAND.name }],
  alternates: languageAlternates("/"),
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    url: SITE_URL,
    title: "Bonu Cakes | Vietnamese Bakery, Bubble Tea & Bánh Mì — UK",
    description:
      "Homemade Sài Gòn bánh mì, salted-egg bubble tea and celebration cakes for UK delivery — plus professional bánh mì masterclasses.",
    locale: "en_GB",
    alternateLocale: ["vi_VN"],
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bonu Cakes | Vietnamese Bakery, Bubble Tea & Bánh Mì — UK",
    description:
      "Homemade Sài Gòn bánh mì, salted-egg bubble tea and celebration cakes for UK delivery — plus professional bánh mì masterclasses.",
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={nunitoSans.variable} suppressHydrationWarning>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-N2YKRZNC4F"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-N2YKRZNC4F');
            `,
          }}
        />
      </head>
      <body className="antialiased bg-cream">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
