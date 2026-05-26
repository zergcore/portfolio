import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";

/* ─── Single source of truth ─────────────────────────────── */

export const siteConfig = {
  name: "Zaidibeth Ramos",
  title: "Zaidibeth Ramos — Full-Stack Engineer",
  description:
    "Fullstack Engineer with 6+ years of experience building scalable, high-impact web applications using TypeScript, React, Node.js, and Python.",
  domain: process.env.NEXT_PUBLIC_SITE_URL ?? "https://zergcore.dev",
  ogImage: { url: "/zr.jpg", width: 1200, height: 630 },
} as const;

/* ─── Builder options ────────────────────────────────────── */

interface BuildMetadataOptions {
  /** Page title — used in `<title>`, OG, and Twitter. */
  title?: string;
  /** Meta description — used in `<meta>`, OG, and Twitter. */
  description?: string;
  /** Canonical path *without* locale prefix (e.g. `/projects`). Pass `""` for the root. */
  path?: string;
  /** Override the default OG image URL. */
  image?: string;
  /** Current locale — used for `alternates` and `openGraph.locale`. */
  locale?: Locale;
  /** OpenGraph type override (default: `"website"`). */
  ogType?: "website" | "article";
  /** Any additional Metadata overrides merged last. */
  extra?: Metadata;
}

/* ─── Builder ────────────────────────────────────────────── */

/**
 * Constructs a fully-populated `Metadata` object with OG and Twitter cards
 * auto-derived from the provided (or default) title/description, eliminating
 * triple-duplication across page segments.
 */
export function buildMetadata(options: BuildMetadataOptions = {}): Metadata {
  const {
    title,
    description = siteConfig.description,
    path,
    image,
    locale,
    ogType = "website",
    extra,
  } = options;

  const ogImageUrl = image ?? siteConfig.ogImage.url;
  const resolvedTitle = title ?? siteConfig.title;
  const canonicalUrl =
    path !== undefined && locale
      ? `${siteConfig.domain}/${locale}${path ? `/${path}` : ""}`
      : undefined;

  return {
    metadataBase: new URL(siteConfig.domain),

    /* ── Title ────────────────────────────────────────────── */
    title: title ?? {
      template: `%s | ${siteConfig.name}`,
      default: siteConfig.title,
    },

    /* ── Description ─────────────────────────────────────── */
    description,

    /* ── Manifest ────────────────────────────────────────── */
    manifest: "/manifest.json",

    /* ── Alternates (only for locale-aware pages) ─────── */
    ...(locale && {
      alternates: {
        canonical: canonicalUrl,
        languages: {
          en: `${siteConfig.domain}/en${path ? `/${path}` : ""}`,
          es: `${siteConfig.domain}/es${path ? `/${path}` : ""}`,
          "x-default": `${siteConfig.domain}/en${path ? `/${path}` : ""}`,
        },
      },
    }),

    /* ── OpenGraph ────────────────────────────────────────── */
    openGraph: {
      type: ogType,
      siteName: siteConfig.domain,
      ...(locale && { locale: locale === "es" ? "es_ES" : "en_US" }),
      title: resolvedTitle,
      description,
      ...(canonicalUrl && { url: canonicalUrl }),
      images: [
        {
          url: ogImageUrl,
          width: siteConfig.ogImage.width,
          height: siteConfig.ogImage.height,
          alt: siteConfig.name,
        },
      ],
    },

    /* ── Twitter ──────────────────────────────────────────── */
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [ogImageUrl],
    },

    /* ── Extra overrides ─────────────────────────────────── */
    ...extra,
  };
}
