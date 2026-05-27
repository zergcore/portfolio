"use client";

interface ServiceStatus {
  key: string;
  configured: boolean;
  env_var: string;
  features: string[];
  setup_url: string;
  notes: string;
}

import { useTranslations } from "next-intl";

export default function SetupClient({
  services,
}: {
  services: ServiceStatus[];
}) {
  const t = useTranslations("adminSetup");
  const configured = services.filter((s) => s.configured);
  const missing = services.filter((s) => !s.configured);

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      {missing.length > 0 ? (
        <div className="px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/40 text-sm text-amber-200">
          <p className="font-medium mb-1">
            {t("servicesNotConfigured", { count: missing.length })}
          </p>
          <p className="text-amber-200/70 text-xs">
            {t("servicesNotConfiguredDesc")}
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
          <h2 className="text-lg font-semibold text-(--text-primary) mb-3">
            {t("missing")}
          </h2>
          <div className="space-y-3">
            {missing.map((svc) => (
              <div
                key={svc.key}
                className="rounded-lg border border-red-500/30 bg-(--bg-surface) p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-400 shrink-0" />
                      <code className="text-sm font-semibold text-(--text-primary)">
                        {svc.env_var}
                      </code>
                    </div>
                    <p className="text-xs text-(--text-secondary) mb-2">
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
                      className="shrink-0 text-xs px-3 py-1.5 rounded-md border border-(--accent-cyan)/40 text-(--accent-cyan) hover:bg-(--accent-cyan)/10 transition-colors"
                    >
                      {t("getKey")}
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
          <h2 className="text-lg font-semibold text-(--text-primary) mb-3">
            {t("configured")}
          </h2>
          <div className="space-y-3">
            {configured.map((svc) => (
              <div
                key={svc.key}
                className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <code className="text-sm font-semibold text-(--text-primary)">
                    {svc.env_var}
                  </code>
                </div>
                <p className="text-xs text-(--text-secondary) mb-2">
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
      <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-5">
        <h2 className="text-lg font-semibold text-(--text-primary) mb-3">
          {t("howToConfigure")}
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-(--text-secondary)">
          <li>{t("howToConfigureStep1")}</li>
          <li>{t("howToConfigureStep2")}</li>
          <li>{t("howToConfigureStep3")}</li>
        </ol>
        <div className="mt-4 p-3 rounded-md bg-(--bg-elevated) text-xs">
          <p className="text-(--text-secondary)">
            <span className="text-(--text-primary) font-medium">
              {t("minimumLocalDev")}
            </span>{" "}
            {t("minimumLocalDevDesc")}
          </p>
          <p className="text-(--text-secondary) mt-1">
            <span className="text-(--text-primary) font-medium">
              {t("recommended")}
            </span>{" "}
            {t("recommendedDesc")}
          </p>
        </div>
      </div>
    </div>
  );
}
