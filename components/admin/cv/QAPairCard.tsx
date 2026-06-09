import { QaAnswerPair } from "@/lib/adminApi";
import { useRef, useState } from "react";

/** Reflect prop changes into local state when the parent replaces the pair after a regenerate. */
function useStateSync(value: string, setter: (v: string) => void) {
  const ref = useRef(value);
  if (ref.current !== value) {
    ref.current = value;
    setter(value);
  }
}

export function QaPairCard(props: {
  index: number;
  pair: QaAnswerPair;
  copied: boolean;
  onCopy: (text: string) => void;
  onRegenerate: (hint: string) => Promise<void>;
}) {
  const { index, pair, copied, onCopy, onRegenerate } = props;
  const qStr = typeof pair.question === "string" ? pair.question : (pair.question as any)?.en || "";
  const aStr = typeof pair.answer === "string" ? pair.answer : (pair.answer as any)?.en || "";
  
  const [hint, setHint] = useState<string>(pair.hint ?? "");
  const [showHint, setShowHint] = useState<boolean>(
    !!(pair.hint && pair.hint.trim()),
  );
  const [regenerating, setRegenerating] = useState(false);
  const isPlaceholder = aStr.includes("NEEDS_HUMAN_INPUT");

  // If the parent updates the pair (after a successful regenerate), sync the hint
  // so the input reflects what the model just used.
  useStateSync(pair.hint ?? "", setHint);

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      await onRegenerate(hint);
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="bg-(--bg-elevated) rounded-xl border border-(--border-default) p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-foreground">
          <span className="text-(--accent-primary) mr-1.5">Q{index + 1}.</span>
          {qStr}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onCopy(aStr)}
            className="px-3 py-1 rounded border border-(--border-default) text-xs text-(--text-secondary) hover:text-foreground transition-colors"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-3 py-1 rounded border border-(--accent-primary) text-xs text-(--accent-primary) hover:bg-(--accent-primary)/10 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            {regenerating && (
              <span className="animate-spin inline-block w-2.5 h-2.5 border-2 border-(--accent-primary) border-t-transparent rounded-full" />
            )}
            Regenerate
          </button>
        </div>
      </div>

      <textarea
        readOnly
        rows={Math.min(10, Math.max(3, Math.ceil(aStr.length / 80)))}
        value={aStr}
        onFocus={(e) => e.currentTarget.select()}
        className={`w-full bg-(--bg-input) border border-(--border-default) rounded-lg px-3 py-2 text-sm font-mono ${
          isPlaceholder
            ? "text-amber-700 dark:text-amber-400 italic"
            : "text-foreground"
        }`}
      />
      {isPlaceholder && (
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          The model couldn&apos;t answer this from your profile. Add a hint
          below (optional) and regenerate, or fill it in yourself.
        </p>
      )}

      {!showHint ? (
        <button
          onClick={() => setShowHint(true)}
          className="text-xs text-(--accent-primary) hover:underline"
        >
          + Add hint (optional)
        </button>
      ) : (
        <div>
          <label className="block text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">
            Hint (optional) — extra context the model should treat as truth for
            this question
          </label>
          <textarea
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            rows={2}
            placeholder="e.g. This portfolio uses Pydantic AI · I have AWS but no GCP · Personal project, not in production"
            className="w-full bg-(--bg-input) border border-(--border-default) rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-primary)"
          />
          <p className="text-[10px] text-(--text-muted) mt-1">
            Leave blank for no hint. Click Regenerate above to apply.
          </p>
        </div>
      )}
    </div>
  );
}
