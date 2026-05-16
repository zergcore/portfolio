"use client";

import { useState, useRef } from "react";
import { streamRewrite } from "@/lib/aiStream";

interface AISuggestButtonProps {
  sourceText: string;
  label?: string;
  mode?: "suggest" | "suggest_tags" | "suggest_skills";
  availableSkills?: string[];
  onAccept: (text: string) => void;
}

export default function AISuggestButton({
  sourceText,
  label = "Suggest",
  mode = "suggest",
  availableSkills,
  onAccept,
}: AISuggestButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [suggestion, setSuggestion] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const tooShort = sourceText.trim().length < 20;

  const run = () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setStatus("loading");
    setSuggestion("");

    streamRewrite({
      text: sourceText,
      locale: "en",
      fieldKind: "paragraph",
      mode,
      availableSkills,
      signal: abortRef.current.signal,
      onChunk: (chunk) => setSuggestion((prev) => prev + chunk),
      onDone: () => setStatus("done"),
      onError: () => setStatus("error"),
    });
  };

  const handleAccept = () => {
    onAccept(suggestion);
    setStatus("idle");
    setSuggestion("");
  };

  const handleDismiss = () => {
    abortRef.current?.abort();
    setStatus("idle");
    setSuggestion("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        disabled={tooShort || status === "loading"}
        onClick={run}
        title={tooShort ? "Add a description first (min 20 chars)" : "Suggest from description"}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-[var(--accent-violet)] border border-[var(--accent-violet)]/60 hover:bg-[var(--accent-violet)] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span aria-hidden>✨</span>
        <span>{status === "loading" ? "Thinking…" : label}</span>
      </button>

      {(status === "loading" || status === "done") && suggestion && (
        <div className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--accent-violet)]/40 text-xs">
          <p className="text-[var(--text-primary)] mb-2 font-mono">
            {suggestion}
            {status === "loading" && (
              <span className="inline-block w-0.5 h-3 bg-[var(--accent-violet)] ml-0.5 animate-pulse" />
            )}
          </p>
          {status === "done" && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAccept}
                className="px-2 py-0.5 rounded bg-[var(--accent-violet)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="px-2 py-0.5 rounded border border-[var(--border-default)] text-[var(--text-secondary)] text-xs hover:bg-[var(--bg-base)] transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {status === "error" && (
        <p className="text-xs text-[var(--color-error)]">Failed — try again.</p>
      )}
    </div>
  );
}
