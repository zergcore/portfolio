import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export default function V2Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fontVariables} v2`}>
        {children}
      </body>
    </html>
  );
}
