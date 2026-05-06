import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MetricoolScript from "@/components/scripts/MetricoolScript";
import LinkedInScript from "@/components/scripts/LinkedInScript";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zergcore.dev"),
  title: {
    template: "%s | Zaidibeth Ramos",
    default: "Ing. Zaidibeth Ramos — Full-Stack Engineer",
  },
  description:
    "Fullstack Engineer with 6+ years of experience building scalable, high-impact web applications using TypeScript, React, Node.js, and Python. Proven success leading integrations and performance-focused projects in both startup and enterprise settings. Passionate about clean code, distributed systems, and AI innovation. Thrives in collaborative, remote-first teams driving real-world impact.",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "Zergcore.dev",
    locale: "en_US",
    title: "Ing. Zaidibeth Ramos — Full-Stack Engineer",
    description:
      "Fullstack Engineer with 6+ years of experience building scalable, high-impact web applications using TypeScript, React, Node.js, and Python.",
    url: "https://zergcore.dev",
    images: [
      {
        url: "/zr.jpg",
        width: 1200,
        height: 630,
        alt: "Zaidibeth Ramos — Full-Stack Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ing. Zaidibeth Ramos — Full-Stack Engineer",
    description:
      "Fullstack Engineer with 6+ years of experience building scalable, high-impact web applications using TypeScript, React, Node.js, and Python.",
    images: ["/zr.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <link
          rel="apple-touch-icon"
          href="/apple-icon.png"
          type="image/png"
          sizes="<inferred_size>"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)]`}
      >
        {children}
        <MetricoolScript />
        <LinkedInScript />
      </body>
    </html>
  );
}
