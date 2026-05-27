import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
      </head>
      <body
        className={`${fontVariables} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
