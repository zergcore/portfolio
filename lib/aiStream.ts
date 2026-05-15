import type { RewriteOptions } from "@/lib/types/ai";

export type { RewriteFieldKind, RewriteStyle, RewriteOptions } from "@/lib/types/ai";

/**
 * Streams a rewrite from the backend via the /api/ai/rewrite route handler.
 * Calls onChunk for each token, onDone on completion, onError on failure.
 */
export async function streamRewrite({
  text,
  locale,
  fieldKind,
  style,
  signal,
  onChunk,
  onDone,
  onError,
}: RewriteOptions): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/ai/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        locale,
        field_kind: fieldKind,
        style: style ?? undefined,
      }),
      signal,
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") return;
    onError("Connection failed — try again.");
    return;
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    onError(msg || "AI service unavailable — try again.");
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onError("No response stream.");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]" || data === "[ERROR]") {
          onDone();
          return;
        }
        onChunk(data);
      }
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") return;
    onError("Connection lost — retry?");
  } finally {
    onDone();
  }
}
