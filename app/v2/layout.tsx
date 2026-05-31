import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import SiteNav from "@/components/nav/site-nav";
import SiteFooter from "@/components/site/footer";
import "../globals.css";

export default function V2Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fontVariables} v2`}>
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
