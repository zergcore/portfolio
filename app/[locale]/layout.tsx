import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/config";
import MetricoolScript from "@/components/scripts/MetricoolScript";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const domain = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zergcore.dev";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(domain),
    title: {
      template: "%s | Zaidibeth Ramos",
      default: "Zaidibeth Ramos — Full-Stack Engineer",
    },
    description:
      "Fullstack Engineer with 6+ years of experience building scalable, high-impact web applications using TypeScript, React, Node.js, and Python.",
    manifest: "/manifest.json",
    alternates: {
      canonical: `${domain}/${locale}`,
      languages: {
        en: `${domain}/en`,
        es: `${domain}/es`,
        "x-default": `${domain}/en`,
      },
    },
    openGraph: {
      type: "website",
      siteName: domain,
      locale: locale === "es" ? "es_ES" : "en_US",
      title: "Zaidibeth Ramos — Full-Stack Engineer",
      description:
        "Fullstack Engineer with 6+ years of experience building scalable, high-impact web applications using TypeScript, React, Node.js, and Python.",
      url: `${domain}/${locale}`,
      images: [{ url: "/zr.jpg", width: 1200, height: 630, alt: "Zaidibeth Ramos" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Zaidibeth Ramos — Full-Stack Engineer",
      description:
        "Fullstack Engineer with 6+ years of experience building scalable, high-impact web applications using TypeScript, React, Node.js, and Python.",
      images: ["/zr.jpg"],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <MetricoolScript />
      </body>
    </html>
  );
}
