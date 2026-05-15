"use client";

import { useEffect } from "react";
import Section from "@/components/ui/Section";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Projects page error:", error);
  }, [error]);

  return (
    <main className="flex-1 flex flex-col">
      <Section id="projects-error" className="pt-32">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-error)]/10 text-[var(--color-error)]">
            <AlertTriangle size={26} />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Couldn&apos;t load projects
          </h1>
          <p className="text-[var(--text-secondary)]">
            The projects service is taking too long to respond. This usually clears in a few seconds — please try again.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-[var(--accent-cyan)] text-[var(--bg-base)] hover:opacity-90 transition-opacity"
          >
            <RotateCcw size={15} />
            Retry
          </button>
          {error.digest && (
            <p className="text-xs font-mono text-[var(--text-muted)]">
              ref: {error.digest}
            </p>
          )}
        </div>
      </Section>
    </main>
  );
}
