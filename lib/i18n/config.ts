export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const LATAM_COUNTRIES = new Set([
  "ES",
  "MX",
  "AR",
  "CO",
  "VE",
  "CL",
  "PE",
  "EC",
  "GT",
  "CU",
  "BO",
  "DO",
  "HN",
  "PY",
  "SV",
  "NI",
  "CR",
  "PA",
  "UY",
]);
