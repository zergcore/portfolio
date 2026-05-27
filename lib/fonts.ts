import { Geist, JetBrains_Mono } from "next/font/google";

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

/** Space-separated CSS variable classes for `<body>`. */
export const fontVariables = `${geistSans.variable} ${jetBrainsMono.variable}`;
