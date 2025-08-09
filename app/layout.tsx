import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MetricoolScript from "@/components/scripts/MetricoolScript";
import LinkedInScript from "@/components/scripts/LinkedInScript";
import "./globals.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ing. Zaidibeth Ramos",
  description: "Fullstack Engineer with 6+ years of experience building scalable, high-impact web applications using TypeScript, React, Node.js, and Python. Proven success leading integrations and performance-focused projects in both startup and enterprise settings. Passionate about clean code, distributed systems, and AI innovation. Thrives in collaborative, remote-first teams driving real-world impact.",
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" type="image/png" sizes="<inferred_size>" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          {children}
        <MetricoolScript />
        <LinkedInScript />
      </body>
    </html>
  );
}
