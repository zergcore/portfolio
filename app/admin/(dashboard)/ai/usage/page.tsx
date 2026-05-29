import { getAiUsage, getProviderCredits } from "@/app/actions/ai";
import { getTranslations } from "next-intl/server";

function fmt(n: number | null, unit = ""): string {
  if (n == null) return "—";
  return unit ? `${n.toLocaleString()} ${unit}` : n.toLocaleString();
}

export default async function AIUsagePage() {
  const t = await getTranslations("adminAiUsage");
  const [data, credits] = await Promise.all([
    getAiUsage(),
    getProviderCredits(),
  ]);
  const stats = data?.stats ?? [];
  const calls = data?.calls ?? [];

  return (
    <div className="p-6 max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {t("pageTitle")}
        </h1>
        <p className="text-sm text-(--text-muted)">{t("pageDescription")}</p>
      </div>

      {/* ── Provider balances ── */}
      {credits && Object.keys(credits).length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-(--text-secondary) uppercase tracking-wide mb-3">
            {t("providerBalances")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {credits.openrouter && (
              <div className="bg-(--bg-elevated) rounded-xl border border-(--border-default) p-4 space-y-1">
                <p className="text-xs font-semibold text-(--text-muted) uppercase tracking-wide">
                  OpenRouter
                </p>
                {credits.openrouter.error ? (
                  <p className="text-xs text-(--color-error)">
                    {credits.openrouter.error}
                  </p>
                ) : (
                  <>
                    <p className="text-lg font-bold text-foreground">
                      ${(credits.openrouter.usage_usd ?? 0).toFixed(4)}
                      <span className="text-xs font-normal text-(--text-muted) ml-1">
                        {t("spent")}
                      </span>
                    </p>
                    {credits.openrouter.limit_usd != null ? (
                      <p className="text-xs text-(--text-secondary)">
                        {t("limit", {
                          limit: credits.openrouter.limit_usd.toFixed(2),
                        })}
                      </p>
                    ) : (
                      <p className="text-xs text-(--text-secondary)">
                        {t("noSpendLimit")}
                      </p>
                    )}
                    {credits.openrouter.is_free_tier && (
                      <p className="text-xs text-emerald-400">
                        {t("freeTier")}
                      </p>
                    )}
                    {credits.openrouter.label && (
                      <p className="text-xs text-(--text-muted) truncate">
                        {t("key", { label: credits.openrouter.label })}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
            {credits.groq && (
              <div className="bg-(--bg-elevated) rounded-xl border border-(--border-default) p-4 space-y-1">
                <p className="text-xs font-semibold text-(--text-muted) uppercase tracking-wide">
                  Groq
                </p>
                <p className="text-lg font-bold text-emerald-400">
                  {t("free")}
                </p>
                <p className="text-xs text-(--text-secondary)">
                  {credits.groq.note}
                </p>
                <a
                  href={credits.groq.docs_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-(--accent-cyan) hover:underline"
                >
                  {t("viewRateLimits")}
                </a>
              </div>
            )}
            {credits.google && (
              <div className="bg-(--bg-elevated) rounded-xl border border-(--border-default) p-4 space-y-1">
                <p className="text-xs font-semibold text-(--text-muted) uppercase tracking-wide">
                  Google / Gemini
                </p>
                <p className="text-lg font-bold text-(--text-muted)">—</p>
                <p className="text-xs text-(--text-secondary)">
                  {credits.google.note}
                </p>
                <a
                  href={credits.google.docs_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-(--accent-cyan) hover:underline"
                >
                  {t("openAiStudio")}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {!data ? (
        <div className="bg-(--bg-elevated) rounded-xl border border-(--border-default) p-6">
          <p className="text-(--text-muted) text-sm">
            {t.rich("noUsageData", {
              code: (chunks) => (
                <code className="text-(--accent-cyan) text-xs">{chunks}</code>
              ),
            })}
          </p>
        </div>
      ) : (
        <>
          {/* ── Summary by feature / model ── */}
          <section>
            <h2 className="text-sm font-semibold text-(--text-secondary) uppercase tracking-wide mb-3">
              {t("summaryByFeature")}
            </h2>
            <div className="bg-(--bg-elevated) rounded-xl border border-(--border-default) overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-(--border-default)">
                  <tr>
                    {[
                      t("table.feature"),
                      t("table.model"),
                      t("table.provider"),
                      t("table.calls"),
                      t("table.avgLatency"),
                      t("table.inTok"),
                      t("table.outTok"),
                      t("table.totalTok"),
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-(--text-muted) font-medium whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-(--text-muted) text-sm"
                      >
                        {t("table.noCalls")}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {stats.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-(--border-subtle) hover:bg-background"
                        >
                          <td className="px-4 py-2 font-medium">
                            {row.feature}
                          </td>
                          <td className="px-4 py-2 text-xs text-(--text-muted) max-w-40 truncate">
                            {row.model}
                          </td>
                          <td className="px-4 py-2 text-(--text-secondary)">
                            {row.provider}
                          </td>
                          <td className="px-4 py-2">{row.call_count}</td>
                          <td className="px-4 py-2">
                            {fmt(row.avg_latency_ms, "ms")}
                          </td>
                          <td className="px-4 py-2">
                            {fmt(row.total_prompt_tokens, "tok")}
                          </td>
                          <td className="px-4 py-2">
                            {fmt(row.total_completion_tokens, "tok")}
                          </td>
                          <td className="px-4 py-2 font-medium">
                            {fmt(row.total_tokens, "tok")}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-background font-semibold">
                        <td className="px-4 py-2" colSpan={3}>
                          {t("table.total")}
                        </td>
                        <td className="px-4 py-2">
                          {stats.reduce((s, r) => s + r.call_count, 0)}
                        </td>
                        <td className="px-4 py-2">—</td>
                        <td className="px-4 py-2">
                          {fmt(
                            stats.reduce(
                              (s, r) => s + r.total_prompt_tokens,
                              0,
                            ),
                            "tok",
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {fmt(
                            stats.reduce(
                              (s, r) => s + r.total_completion_tokens,
                              0,
                            ),
                            "tok",
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {fmt(
                            stats.reduce((s, r) => s + r.total_tokens, 0),
                            "tok",
                          )}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Last 100 calls ── */}
          <section>
            <h2 className="text-sm font-semibold text-(--text-secondary) uppercase tracking-wide mb-3">
              {t("last100Calls")}
            </h2>
            <div className="bg-(--bg-elevated) rounded-xl border border-(--border-default) overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-(--border-default)">
                  <tr>
                    {[
                      t("table.feature"),
                      t("table.provider"),
                      t("table.model"),
                      t("table.inTok"),
                      t("table.outTok"),
                      t("table.latencyMs"),
                      t("table.status"),
                      t("table.time"),
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-(--text-muted) font-medium whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calls.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-(--text-muted) text-sm"
                      >
                        {t("table.noAiCalls")}
                      </td>
                    </tr>
                  ) : (
                    calls.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-(--border-subtle) hover:bg-background"
                      >
                        <td className="px-4 py-2 font-medium">{row.feature}</td>
                        <td className="px-4 py-2">{row.provider}</td>
                        <td className="px-4 py-2 text-xs text-(--text-muted) max-w-32 truncate">
                          {row.model}
                        </td>
                        <td className="px-4 py-2">
                          {fmt(row.prompt_tokens, "tok")}
                        </td>
                        <td className="px-4 py-2">
                          {fmt(row.completion_tokens, "tok")}
                        </td>
                        <td className="px-4 py-2">
                          {fmt(row.latency_ms, "ms")}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={
                              row.succeeded
                                ? "text-(--color-success)"
                                : "text-(--color-error)"
                            }
                          >
                            {row.succeeded ? "✓" : "✗"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-(--text-muted) whitespace-nowrap">
                          {new Date(row.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
