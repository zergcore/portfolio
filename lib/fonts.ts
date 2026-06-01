import { Geist, JetBrains_Mono, Instrument_Serif } from "next/font/google";

export const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

export const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  display: "swap",
});

/** Space-separated CSS variable classes for `<html>` or `<body>`. */
export const fontVariables = `${instrumentSerif.variable} ${jetBrainsMono.variable} ${geistSans.variable}`;
