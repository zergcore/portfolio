import type { ReactNode } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { fontVariables } from "@/lib/fonts";
import "@/app/globals.css";

// 💡 Reverse SEO & Brand Polish
// Explicitly commands search engines to ignore this entire route segment.
export const metadata: Metadata = {
  title: {
    template: "%s | Admin Portal",
    default: "Dashboard | Admin Portal",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true, // Prevents caching of private admin states in search engine memory
  },
  // 💡 Native Next.js 15 icon management (No manual <head> injection needed)
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

interface AdminRootLayoutProps {
  children: ReactNode;
}

export default async function AdminRootLayout({ children }: AdminRootLayoutProps) {
  const messages = await getMessages();
  const locale = await getLocale();

  return (
    // suppressHydrationWarning prevents React crashes if browser extensions modify the dark class
    <html lang={locale} className="dark scroll-smooth" suppressHydrationWarning>
      <body
        className={`${fontVariables} flex min-h-dvh flex-col bg-background text-foreground antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          {/* 💡 The isolated Admin shell. 
            If you ever add a global <Toaster /> for CMS notifications, mount it here. 
          */}
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
