"use client";

interface ServiceStatus {
  key: string;
  configured: boolean;
  env_var: string;
  features: string[];
  setup_url: string;
  notes: string;
}

export default function SetupClient({
  services,
  warnings,
}: {
  services: ServiceStatus[];
  warnings: string[];
}) {
  const configured = services.filter((s) => s.configured);
  const missing = services.filter((s) => !s.configured);

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      {missing.length > 0 ? (
        <div className="px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/40 text-sm text-amber-200">
          <p className="font-medium mb-1">
            {missing.length} service{missing.length !== 1 ? "s" : ""} not
            configured
          </p>
          <p className="text-amber-200/70 text-xs">
            The features listed below will not work until the corresponding
            API keys are set in the backend environment.
          </p>
        </div>
      ) : (
        <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-sm text-emerald-300">
          All services are configured.
        </div>
      )}

      {/* Missing services */}
      {missing.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            Missing
          </h2>
          <div className="space-y-3">
            {missing.map((svc) => (
              <div
                key={svc.key}
                className="rounded-lg border border-red-500/30 bg-[var(--bg-surface)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                      <code className="text-sm font-semibold text-[var(--text-primary)]">
                        {svc.env_var}
                      </code>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mb-2">
                      {svc.notes}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {svc.features.map((f) => (
                        <span
                          key={f}
                          className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/20"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  {svc.setup_url && (
                    <a
                      href={svc.setup_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-xs px-3 py-1.5 rounded-md border border-[var(--accent-cyan)]/40 text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10 transition-colors"
                    >
                      Get key
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configured services */}
      {configured.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            Configured
          </h2>
          <div className="space-y-3">
            {configured.map((svc) => (
              <div
                key={svc.key}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <code className="text-sm font-semibold text-[var(--text-primary)]">
                    {svc.env_var}
                  </code>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-2">
                  {svc.notes}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {svc.features.map((f) => (
                    <span
                      key={f}
                      className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Setup instructions */}
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
          How to configure
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text-secondary)]">
          <li>
            Click <span className="text-[var(--accent-cyan)]">Get key</span>{" "}
            next to a missing service to open its dashboard.
          </li>
          <li>
            Copy the API key and add it to your backend{" "}
            <code className="text-[var(--accent-violet)]">.env</code> file
            (local) or environment variables (Render / hosting provider).
          </li>
          <li>
            Restart the backend server. The status on this page will update
            automatically.
          </li>
        </ol>
        <div className="mt-4 p-3 rounded-md bg-[var(--bg-elevated)] text-xs">
          <p className="text-[var(--text-secondary)]">
            <span className="text-[var(--text-primary)] font-medium">
              Minimum for local dev:
            </span>{" "}
            <code className="text-[var(--accent-violet)]">GEMINI_API_KEY</code>{" "}
            (free tier covers all AI features).
          </p>
          <p className="text-[var(--text-secondary)] mt-1">
            <span className="text-[var(--text-primary)] font-medium">
              Recommended:
            </span>{" "}
            also set{" "}
            <code className="text-[var(--accent-violet)]">GROQ_API_KEY</code>{" "}
            (fallback) and{" "}
            <code className="text-[var(--accent-violet)]">COHERE_API_KEY</code>{" "}
            (better match scoring).
          </p>
        </div>
      </div>
    </div>
  );
}
