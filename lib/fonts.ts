import { Geist, JetBrains_Mono, Instrument_Serif } from "next/font/google";

export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400"
});

export const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

/** Space-separated CSS variable classes for `<body>`. */
export const fontVariables = `${instrumentSerif.variable} ${jetBrainsMono.variable} ${geistSans.variable}`;
