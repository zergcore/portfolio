import { cookies } from "next/headers";

interface AiCallRow {
  feature: string;
  provider: string;
  model: string;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  latency_ms: number | null;
  succeeded: boolean;
  created_at: string;
}

interface AiUsageData {
  calls: AiCallRow[];
}

async function fetchAiUsage(): Promise<AiUsageData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";
    const res = await fetch(`${baseUrl}/ai/usage`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function AIUsagePage() {
  const data = await fetchAiUsage();

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">AI Usage</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Last 100 AI calls. Refreshes every 60 seconds.
      </p>

      {!data ? (
        <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] p-6">
          <p className="text-[var(--text-muted)] text-sm">
            Usage data unavailable. The <code className="text-[var(--accent-cyan)] text-xs">ai_calls</code> migration must be applied first, and the{" "}
            <code className="text-[var(--accent-cyan)] text-xs">GET /api/v1/ai/usage</code> endpoint must exist.
          </p>
        </div>
      ) : (
        <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--border-default)]">
              <tr>
                {["Feature", "Provider", "Model", "In", "Out", "ms", "Status", "Time"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[var(--text-muted)] font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.calls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">
                    No AI calls recorded yet.
                  </td>
                </tr>
              ) : (
                data.calls.map((row, i) => (
                  <tr key={i} className="border-b border-[var(--border-default)] hover:bg-[var(--bg-base)]">
                    <td className="px-4 py-2 font-medium">{row.feature}</td>
                    <td className="px-4 py-2">{row.provider}</td>
                    <td className="px-4 py-2 text-xs text-[var(--text-muted)] max-w-32 truncate">{row.model}</td>
                    <td className="px-4 py-2">{row.prompt_tokens ?? "—"}</td>
                    <td className="px-4 py-2">{row.completion_tokens ?? "—"}</td>
                    <td className="px-4 py-2">{row.latency_ms ?? "—"}</td>
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
      )}
    </div>
  );
}
