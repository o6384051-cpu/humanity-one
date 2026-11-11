import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://humanity-one-wc35.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HUMANITY ONE | معًا من أجل مستقبل أفضل",
    template: "%s | HUMANITY ONE",
  },
  description:
    "HUMANITY ONE منصة إنسانية تساعد الناس على الوصول إلى فرص العمل والتعلم والمبادرات والمشروعات المجتمعية، وتربط أصحاب الفرص بمن يبحثون عنها.",
  applicationName: "HUMANITY ONE",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "HUMANITY ONE",
    title: "HUMANITY ONE | معًا من أجل مستقبل أفضل",
    description:
      "منصة إنسانية لربط الناس بفرص العمل والتعلم والمبادرات والمشروعات المجتمعية.",
    locale: "ar_EG",
  },
  twitter: {
    card: "summary",
    title: "HUMANITY ONE | معًا من أجل مستقبل أفضل",
    description:
      "منصة إنسانية لفرص العمل والتعلم والمبادرات والمشروعات المجتمعية.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
