import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ArrowLeft, MapPin, Clock, Mail } from "lucide-react";

import Section from "@/components/ui/Section";
import ContactForm from "@/components/forms/ContactForm";
import BookACallButton from "@/components/ui/BookACallButton";

import { getProfile } from "@/lib/api";
import { buildMetadata } from "@/lib/metadata";
import { links } from "@/lib/constants/social";

export async function generateMetadata() {
  const t = await getTranslations("contact");
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "contact",
  });
}

export default async function ContactPage() {
  // Parallel fetching prevents waterfalls
  const [t, profile] = await Promise.all([
    getTranslations("contact"),
    getProfile(),
  ]);

  return (
    <main className="isolate flex w-full flex-1 flex-col">
      <Section id="contact" className="pb-16 pt-32">

        {/* Accessible Back Navigation */}
        <Link
          href="/"
          className="group mb-12 inline-flex w-fit items-center gap-2 rounded-md text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--accent-cyan)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          aria-label={t("backToHome")}
        >
          <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
          {t("backToHome")}
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">

          {/* Left Column: Context & Contact Details */}
          <div className="flex flex-col gap-10 lg:col-span-2">
            <header>
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-[var(--text-primary)] md:text-5xl">
                {t("pageHeading")}{" "}
                {t("pageHeadingHighlight") && (
                  <span className="select-none bg-[image:var(--gradient-brand)] bg-clip-text text-transparent">
                    {t("pageHeadingHighlight")}
                  </span>
                )}
              </h1>
              <p className="text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
                {t("pageDescription")}
              </p>

              {profile?.meetingUrl && (
                <div className="mt-8">
                  <BookACallButton href={profile.meetingUrl} />
                </div>
              )}
            </header>

            {/* Semantic Address Tag for SEO/A11y */}
            <address className="flex flex-col gap-5 not-italic">
              <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                  <MapPin size={18} className="text-[var(--accent-cyan)]" aria-hidden="true" />
                </div>
                <span>{t("location")}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                  <Clock size={18} className="text-[var(--accent-cyan)]" aria-hidden="true" />
                </div>
                <span>{t("timezone")}</span>
              </div>

              <a
                href={`mailto:${profile?.email || "hello@example.com"}`}
                className="group flex w-fit items-center gap-4 rounded-full text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] transition-colors group-hover:border-[var(--accent-cyan)] group-focus-visible:ring-2 group-focus-visible:ring-[var(--accent-cyan)]">
                  <Mail size={18} className="text-[var(--accent-cyan)]" aria-hidden="true" />
                </div>
                <span className="group-hover:underline group-hover:underline-offset-4">{t("email")}</span>
              </a>
            </address>

            <div className="border-t border-[var(--border-subtle)] pt-8">
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {t("reachOut")}
              </h2>
              <div className="flex flex-wrap gap-4">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.key}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-[var(--text-muted)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] ${link.color}`}
                      aria-label={link.label}
                    >
                      <Icon size={20} className="transition-transform group-hover:scale-110" aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <section
            aria-labelledby="contact-form-heading"
            className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 shadow-sm md:p-10 lg:col-span-3"
          >
            <h2 id="contact-form-heading" className="mb-8 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {t("sendMessage")}
            </h2>

            {/* Suspense boundary ensures the interactive form doesn't block the static shell from streaming */}
            <Suspense fallback={<div className="h-[400px] w-full animate-pulse rounded-xl bg-[var(--border-subtle)]/50" />}>
              <ContactForm />
            </Suspense>
          </section>

        </div>
      </Section>
    </main>
  );
}