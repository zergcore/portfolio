"use client";

import { useState } from "react";
import AIEnhancePanel from "./AIEnhancePanel";

interface AIEnhanceButtonProps {
  sourceText: string;
  locale: "en" | "es";
  fieldKind: "bullet" | "paragraph" | "title";
  fieldLabel: string;
  onAccept: (text: string) => void;
}

export default function AIEnhanceButton({
  sourceText,
  locale,
  fieldKind,
  fieldLabel,
  onAccept,
}: AIEnhanceButtonProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const tooShort = sourceText.trim().length < 20;

  return (
    <>
      <button
        type="button"
        disabled={tooShort}
        onClick={() => setPanelOpen(true)}
        title={tooShort ? "Text too short (min 20 chars)" : "Improve with AI"}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-[var(--accent-violet)] border border-[var(--accent-violet)]/60 hover:bg-[var(--accent-violet)] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span aria-hidden>✨</span>
        <span>Rewrite</span>
      </button>

      <AIEnhancePanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onAccept={onAccept}
        sourceText={sourceText}
        locale={locale}
        fieldKind={fieldKind}
        fieldLabel={fieldLabel}
      />
    </>
  );
}
