"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/config";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  const toggle = () => {
    const next: Locale = locale === "en" ? "es" : "en";
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;samesite=lax`;
    router.replace(pathname, { locale: next });
  };

  return (
    <button
      onClick={toggle}
      aria-label={t("switchLanguage")}
      className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-cyan)] transition-colors"
    >
      {locale === "en" ? "ES" : "EN"}
    </button>
  );
}
