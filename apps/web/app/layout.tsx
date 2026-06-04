import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "./components/GoogleAnalytics";
import { absoluteUrl, jsonLd, siteConfig, socialImage } from "./lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "夜虫指数",
    "夜間昆虫",
    "昆虫観察",
    "蛾",
    "甲虫",
    "天気",
    "月明かり",
    "夜の飛翔条件",
  ],
  authors: [{ name: "ryuuuu092", url: siteConfig.xUrl }],
  creator: "ryuuuu092",
  publisher: siteConfig.name,
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/twitter-image"],
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
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    applicationCategory: "WeatherApplication",
    operatingSystem: "Web",
    inLanguage: "ja",
    creator: {
      "@type": "Person",
      name: "ryuuuu092",
      sameAs: [siteConfig.xUrl, siteConfig.githubUrl],
    },
  };

  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(websiteJsonLd) }}
        />
        {children}
        <GoogleAnalytics
          measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
        />
      </body>
    </html>
  );
}
