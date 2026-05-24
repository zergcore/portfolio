import { getAiUsage, getProviderCredits } from "@/app/actions/ai";

function fmt(n: number | null, unit = ""): string {
  if (n == null) return "—";
  return unit ? `${n.toLocaleString()} ${unit}` : n.toLocaleString();
}

export default async function AIUsagePage() {
  const [data, credits] = await Promise.all([getAiUsage(), getProviderCredits()]);
  const stats = data?.stats ?? [];
  const calls = data?.calls ?? [];

  return (
    <div className="p-6 max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">AI Usage</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Token counts: tiktoken (OpenAI/Groq) · google-genai count_tokens (Gemini). Refreshes every 60 s.
        </p>
      </div>

      {/* ── Provider balances ── */}
      {credits && Object.keys(credits).length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Provider balances
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {credits.openrouter && (
              <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] p-4 space-y-1">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">OpenRouter</p>
                {credits.openrouter.error ? (
                  <p className="text-xs text-[var(--color-error)]">{credits.openrouter.error}</p>
                ) : (
                  <>
                    <p className="text-lg font-bold text-[var(--text-primary)]">
                      ${(credits.openrouter.usage_usd ?? 0).toFixed(4)}
                      <span className="text-xs font-normal text-[var(--text-muted)] ml-1">spent</span>
                    </p>
                    {credits.openrouter.limit_usd != null ? (
                      <p className="text-xs text-[var(--text-secondary)]">
                        Limit: ${credits.openrouter.limit_usd.toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--text-secondary)]">No spend limit set</p>
                    )}
                    {credits.openrouter.is_free_tier && (
                      <p className="text-xs text-emerald-400">Free tier</p>
                    )}
                    {credits.openrouter.label && (
                      <p className="text-xs text-[var(--text-muted)] truncate">Key: {credits.openrouter.label}</p>
                    )}
                  </>
                )}
              </div>
            )}
            {credits.groq && (
              <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] p-4 space-y-1">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Groq</p>
                <p className="text-lg font-bold text-emerald-400">Free</p>
                <p className="text-xs text-[var(--text-secondary)]">{credits.groq.note}</p>
                <a href={credits.groq.docs_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-[var(--accent-cyan)] hover:underline">
                  View rate limits →
                </a>
              </div>
            )}
            {credits.google && (
              <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] p-4 space-y-1">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Google / Gemini</p>
                <p className="text-lg font-bold text-[var(--text-muted)]">—</p>
                <p className="text-xs text-[var(--text-secondary)]">{credits.google.note}</p>
                <a href={credits.google.docs_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-[var(--accent-cyan)] hover:underline">
                  Open AI Studio →
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {!data ? (
        <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] p-6">
          <p className="text-[var(--text-muted)] text-sm">
            Usage data unavailable. The{" "}
            <code className="text-[var(--accent-cyan)] text-xs">ai_calls</code> migration must be applied first.
          </p>
        </div>
      ) : (
        <>
          {/* ── Summary by feature / model ── */}
          <section>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
              Summary by feature
            </h2>
            <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[var(--border-default)]">
                  <tr>
                    {["Feature", "Model", "Provider", "Calls", "Avg latency", "In (tok)", "Out (tok)", "Total (tok)"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[var(--text-muted)] font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">
                        No calls recorded yet.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {stats.map((row, i) => (
                        <tr key={i} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-base)]">
                          <td className="px-4 py-2 font-medium">{row.feature}</td>
                          <td className="px-4 py-2 text-xs text-[var(--text-muted)] max-w-40 truncate">{row.model}</td>
                          <td className="px-4 py-2 text-[var(--text-secondary)]">{row.provider}</td>
                          <td className="px-4 py-2">{row.call_count}</td>
                          <td className="px-4 py-2">{fmt(row.avg_latency_ms, "ms")}</td>
                          <td className="px-4 py-2">{fmt(row.total_prompt_tokens, "tok")}</td>
                          <td className="px-4 py-2">{fmt(row.total_completion_tokens, "tok")}</td>
                          <td className="px-4 py-2 font-medium">{fmt(row.total_tokens, "tok")}</td>
                        </tr>
                      ))}
                      <tr className="bg-[var(--bg-base)] font-semibold">
                        <td className="px-4 py-2" colSpan={3}>Total</td>
                        <td className="px-4 py-2">{stats.reduce((s, r) => s + r.call_count, 0)}</td>
                        <td className="px-4 py-2">—</td>
                        <td className="px-4 py-2">{fmt(stats.reduce((s, r) => s + r.total_prompt_tokens, 0), "tok")}</td>
                        <td className="px-4 py-2">{fmt(stats.reduce((s, r) => s + r.total_completion_tokens, 0), "tok")}</td>
                        <td className="px-4 py-2">{fmt(stats.reduce((s, r) => s + r.total_tokens, 0), "tok")}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Last 100 calls ── */}
          <section>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
              Last 100 calls
            </h2>
            <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[var(--border-default)]">
                  <tr>
                    {["Feature", "Provider", "Model", "In (tok)", "Out (tok)", "Latency (ms)", "Status", "Time"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[var(--text-muted)] font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calls.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">
                        No AI calls recorded yet.
                      </td>
                    </tr>
                  ) : (
                    calls.map((row, i) => (
                      <tr key={i} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-base)]">
                        <td className="px-4 py-2 font-medium">{row.feature}</td>
                        <td className="px-4 py-2">{row.provider}</td>
                        <td className="px-4 py-2 text-xs text-[var(--text-muted)] max-w-32 truncate">{row.model}</td>
                        <td className="px-4 py-2">{fmt(row.prompt_tokens, "tok")}</td>
                        <td className="px-4 py-2">{fmt(row.completion_tokens, "tok")}</td>
                        <td className="px-4 py-2">{fmt(row.latency_ms, "ms")}</td>
                        <td className="px-4 py-2">
                          <span className={row.succeeded ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}>
                            {row.succeeded ? "✓" : "✗"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-[var(--text-muted)] whitespace-nowrap">
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
