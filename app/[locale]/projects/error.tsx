"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Section from "@/components/ui/Section";

interface ProjectsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProjectsError({
  error,
  reset,
}: ProjectsErrorProps) {
  // 💡 Synchronous translation hook for Client Components
  const t = useTranslations("error");

  useEffect(() => {
    // In a production environment, this should route to Sentry, Datadog, or LogRocket
    console.error("Projects boundary caught:", error);
  }, [error]);

  return (
    <main className="isolate flex w-full flex-1 flex-col">
      <Section id="projects-error" className="py-32">
        <div
          className="mx-auto flex max-w-xl flex-col items-center space-y-6 text-center"
          // 💡 Instantly notifies screen readers that a critical state change occurred
          role="alert"
          aria-live="assertive"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <AlertTriangle size={32} aria-hidden="true" />
          </div>

          <header>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {t("projects.title")}
            </h1>
            <p className="text-base text-[var(--text-secondary)]">
              {t("projects.description")}
            </p>
          </header>

          <button
            onClick={reset}
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--accent-cyan)] px-6 py-3 text-sm font-semibold text-[var(--background)] shadow-md transition-all hover:opacity-90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          >
            {/* 💡 Micro-interaction: Spins on hover to indicate a refresh action */}
            <RotateCcw
              size={16}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-rotate-180"
            />
            {t("projects.retry")}
          </button>

          {error.digest && (
            <p className="text-xs font-mono text-[var(--text-muted)]">
              {t("ref")}: {error.digest}
            </p>
          )}
        </div>
      </Section>
    </main>
  );
}