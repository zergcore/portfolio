"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { streamRewrite } from "@/lib/aiStream";
import type { RewriteStyle, RewriteFieldKind, RewriteMode } from "@/lib/types/ai";

interface AIEnhancePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (text: string) => void;
  onAcceptTranslation?: (text: string, targetLocale: "en" | "es") => void;
  sourceText: string;
  locale: "en" | "es";
  fieldKind: RewriteFieldKind;
  fieldLabel: string;
}

export default function AIEnhancePanel({
  isOpen,
  onClose,
  onAccept,
  onAcceptTranslation,
  sourceText,
  locale,
  fieldKind,
  fieldLabel,
}: AIEnhancePanelProps) {
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<RewriteStyle | null>(null);
  const [activeMode, setActiveMode] = useState<RewriteMode>("rewrite");
  const [activeTargetLocale, setActiveTargetLocale] = useState<"en" | "es">(
    locale === "en" ? "es" : "en"
  );
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    (opts: { style?: RewriteStyle | null; mode?: RewriteMode; targetLocale?: "en" | "es" }) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setStreamedText("");
      setError(null);
      setIsStreaming(true);

      streamRewrite({
        text: sourceText,
        locale,
        fieldKind,
        style: opts.style ?? null,
        mode: opts.mode ?? "rewrite",
        targetLocale: opts.targetLocale,
        signal: abortRef.current.signal,
        onChunk: (chunk) => setStreamedText((prev) => prev + chunk),
        onDone: () => setIsStreaming(false),
        onError: (msg) => {
          setError(msg);
          setIsStreaming(false);
        },
      });
    },
    [sourceText, locale, fieldKind]
  );

  useEffect(() => {
    if (isOpen) {
      setStreamedText("");
      setError(null);
      setSelectedStyle(null);
      setActiveMode("rewrite");
      setActiveTargetLocale(locale === "en" ? "es" : "en");
      startStream({ mode: "rewrite" });
    }
    return () => {
      if (!isOpen) abortRef.current?.abort();
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRegenerate = (style: RewriteStyle | null) => {
    setSelectedStyle(style);
    setActiveMode("rewrite");
    startStream({ style, mode: "rewrite" });
  };

  const handleTranslate = (targetLocale: "en" | "es") => {
    setActiveTargetLocale(targetLocale);
    setActiveMode("translate");
    setSelectedStyle(null);
    startStream({ mode: "translate", targetLocale });
  };

  const handleAccept = () => {
    if (activeMode === "translate" && onAcceptTranslation) {
      onAcceptTranslation(streamedText, activeTargetLocale);
    } else {
      onAccept(streamedText);
    }
    onClose();
  };

  const handleClose = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    onClose();
  };

  const modeLabel =
    activeMode === "translate"
      ? `Translating → ${activeTargetLocale.toUpperCase()}`
      : `AI Suggestion`;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={handleClose} aria-hidden />

      <div className="fixed inset-y-0 right-0 w-96 bg-[var(--bg-elevated)] border-l border-[var(--border-default)] shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-2">
            <span className="text-[var(--accent-violet)] text-base">✨</span>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {modeLabel} — {fieldLabel}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl leading-none px-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Stream area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {error ? (
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          ) : streamedText ? (
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
              {streamedText}
              {isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-[var(--accent-violet)] ml-0.5 animate-pulse" />
              )}
            </p>
          ) : (
            <p className="text-sm text-[var(--text-muted)] animate-pulse">Thinking…</p>
          )}
        </div>

        {/* Translate */}
        <div className="px-4 py-2 border-t border-[var(--border-default)]">
          <p className="text-xs text-[var(--text-muted)] mb-2">Translate to:</p>
          <div className="flex gap-2">
            {(["en", "es"] as const).map((tl) => (
              <button
                key={tl}
                type="button"
                disabled={isStreaming || tl === locale}
                onClick={() => handleTranslate(tl)}
                className={`px-2 py-1 rounded text-xs border transition-colors disabled:opacity-40 ${
                  activeMode === "translate" && activeTargetLocale === tl
                    ? "border-[var(--accent-violet)] text-[var(--accent-violet)] bg-[var(--accent-violet)]/10"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-violet)]"
                }`}
              >
                → {tl === "en" ? "English" : "Español"}
              </button>
            ))}
          </div>
        </div>

        {/* Rewrite style hints */}
        <div className="px-4 py-2 border-t border-[var(--border-default)]">
          <p className="text-xs text-[var(--text-muted)] mb-2">Rewrite with hint:</p>
          <div className="flex gap-2">
            {(["shorter", "technical", "friendlier"] as const).map((s) => (
              <button
                key={s}
                type="button"
                disabled={isStreaming}
                onClick={() => handleRegenerate(s)}
                className={`px-2 py-1 rounded text-xs border transition-colors disabled:opacity-40 ${
                  activeMode === "rewrite" && selectedStyle === s
                    ? "border-[var(--accent-violet)] text-[var(--accent-violet)] bg-[var(--accent-violet)]/10"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-violet)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t border-[var(--border-default)] flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-base)] transition-colors"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() =>
              activeMode === "translate"
                ? handleTranslate(activeTargetLocale)
                : handleRegenerate(selectedStyle)
            }
            disabled={isStreaming}
            className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-base)] transition-colors disabled:opacity-40"
          >
            Regenerate
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={isStreaming || !streamedText}
            className="flex-1 px-3 py-2 rounded-lg bg-[var(--accent-violet)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {activeMode === "translate" && onAcceptTranslation
              ? `Accept → ${activeTargetLocale.toUpperCase()}`
              : "Accept"}
          </button>
        </div>
      </div>
    </>
  );
}
