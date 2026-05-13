import { Locale } from "./config";

type LocalizedValue =
  | { en?: string; es?: string }
  | string
  | null
  | undefined;

export function tLocalized(value: LocalizedValue, locale: Locale): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.en || "";
}
