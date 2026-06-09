"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { testAiFeature } from "@/app/actions/ai";
import { EditPanel } from "@/components/admin/ai/EditPanel";
import { ModelBadge } from "@/components/admin/ai/ModelBadge";
import { FEATURE_META } from "@/lib/constants/ai";
import type { AiConfigData, AiKnownModel, AiTestResult } from "@/lib/types/ai";
import AiModelsManager from "./AiModelsManager";

interface Props {
  config: AiConfigData;
  knownModels: AiKnownModel[];
}

export default function AiConfigClient({ config, knownModels }: Props) {
  const router = useRouter();
  const t = useTranslations("adminAiConfig");
  const features = Object.keys(config);
  const maxChain =
    features.length > 0
      ? Math.max(...features.map((f) => config[f].length))
      : 0;

  const [testResults, setTestResults] = useState<
    Record<string, AiTestResult | "loading">
  >({});
  const [editingFeature, setEditingFeature] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleTest = (feature: string) => {
    setTestResults((prev) => ({ ...prev, [feature]: "loading" }));
    startTransition(async () => {
      const result = await testAiFeature(feature);
      setTestResults((prev) => ({ ...prev, [feature]: result }));
    });
  };

  if (features.length === 0) {
    return (
      <div className="rounded-xl border border-(--border-default) bg-(--bg-elevated) p-8 text-center text-sm text-(--text-muted)">
        {t("emptyConfig")}
      </div>
    );
  }

  const bgCell = "bg-(--bg-elevated) group-hover:bg-(--bg-base)";

  return (
    <div className="space-y-10">
      <div className="overflow-x-auto rounded-xl border border-(--border-default) bg-(--bg-elevated)">
        <table className="w-full text-sm">
          <thead className="border-b border-(--border-default)">
            <tr>
              <th className="px-4 py-3 text-left text-(--text-muted) font-medium whitespace-nowrap sticky left-0 z-10 bg-(--bg-elevated)">
                {t("table.feature")}
              </th>
              {Array.from({ length: maxChain }, (_, i) => (
                <th
                  key={`chain-${i}`}
                  className="px-3 py-3 text-left text-(--text-muted) font-medium whitespace-nowrap"
                >
                  #{i + 1}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-(--text-muted) font-medium whitespace-nowrap">
                {t("table.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => {
              const chain = config[feature];
              const testResult = testResults[feature];
              const isEditing = editingFeature === feature;

              return (
                <Fragment key={feature}>
                  <tr className="group border-b border-[--border-subtle] last:border-0">
                    <td className={`px-4 py-3 sticky left-0 z-10 ${bgCell}`}>
                      <span className="font-medium text-[--text-primary] whitespace-nowrap">
                        {feature}
                      </span>
                      {FEATURE_META[feature] && (
                        <p className="text-[10px] text-[--text-muted] mt-0.5 max-w-[160px]">
                          {FEATURE_META[feature].description}
                        </p>
                      )}
                    </td>
                    {Array.from({ length: maxChain }, (_, i) => (
                      <td
                        key={`model-badge-${feature}-${i}`}
                        className="px-3 py-2 align-top"
                      >
                        {chain[i] ? <ModelBadge entry={chain[i]} /> : null}
                      </td>
                    ))}
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2 flex-wrap min-w-[220px]">
                        <button
                          onClick={() => handleTest(feature)}
                          disabled={testResult === "loading"}
                          className="px-2.5 py-1 text-xs rounded-md bg-(--accent-violet)/10 text-(--accent-violet) border border-(--accent-violet)/30 hover:bg-(--accent-violet)/20 disabled:opacity-50 transition-colors"
                        >
                          {testResult === "loading" ? "…" : t("table.test")}
                        </button>
                        <button
                          onClick={() =>
                            setEditingFeature(isEditing ? null : feature)
                          }
                          className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                            isEditing
                              ? "border-(--accent-cyan) text-(--accent-cyan) bg-(--accent-cyan)/10"
                              : "border-(--border-default) text-(--text-secondary) hover:border-(--accent-cyan) hover:text-(--accent-cyan)"
                          }`}
                        >
                          {t("table.edit")}
                        </button>
                        {testResult &&
                          testResult !== "loading" &&
                          (testResult.ok ? (
                            <span className="text-xs text-green-400 whitespace-nowrap">
                              ✓ {testResult.latency_ms}ms
                            </span>
                          ) : (
                            <span
                              className="text-xs text-red-400 max-w-[160px] truncate"
                              title={testResult.error}
                            >
                              ✗ {testResult.error}
                            </span>
                          ))}
                      </div>
                    </td>
                  </tr>

                  {isEditing && (
                    <EditPanel
                      feature={feature}
                      initial={chain.map((e) => ({
                        provider: e.provider,
                        model: e.model,
                      }))}
                      knownModels={knownModels}
                      onClose={() => setEditingFeature(null)}
                      onSaved={() => router.refresh()}
                    />
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <AiModelsManager models={knownModels} />
    </div>
  );
}
