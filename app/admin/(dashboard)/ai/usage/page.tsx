import { getAiUsage } from "@/app/actions/ai";

function fmt(n: number | null, unit = ""): string {
  if (n == null) return "—";
  return unit ? `${n.toLocaleString()} ${unit}` : n.toLocaleString();
}

export default async function AIUsagePage() {
  const data = await getAiUsage();
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
