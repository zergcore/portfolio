"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";

export default function AdminLocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("adminCommon");

  const toggle = () => {
    const next: Locale = locale === "en" ? "es" : "en";
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;samesite=lax`;
    // We use router.refresh() because admin routes do not use locale prefixes.
    // Refreshing forces the server components to read the new cookie and re-render.
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      aria-label={t("language")}
      className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded border border-(--border-default) text-(--text-secondary) hover:text-foreground hover:border-(--accent-cyan) transition-colors"
    >
      {locale === "en" ? "ES" : "EN"}
    </button>
  );
}
