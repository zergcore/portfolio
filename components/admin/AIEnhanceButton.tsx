"use client";

import { useState } from "react";
import AIEnhancePanel from "./AIEnhancePanel";
import type { RewriteFieldKind } from "@/lib/types/ai";

interface AIEnhanceButtonProps {
  sourceText: string;
  locale: "en" | "es";
  fieldKind: RewriteFieldKind;
  fieldLabel: string;
  onAccept: (text: string) => void;
  onAcceptTranslation?: (text: string, targetLocale: "en" | "es") => void;
}

export default function AIEnhanceButton({
  sourceText,
  locale,
  fieldKind,
  fieldLabel,
  onAccept,
  onAcceptTranslation,
}: AIEnhanceButtonProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const minLength = fieldKind === "title" ? 2 : 20;
  const tooShort = sourceText.trim().length < minLength;

  return (
    <>
      <button
        type="button"
        disabled={tooShort}
        onClick={() => setPanelOpen(true)}
        title={tooShort ? `Text too short (min ${minLength} chars)` : "Improve with AI"}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-[var(--accent-violet)] border border-[var(--accent-violet)]/60 hover:bg-[var(--accent-violet)] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span aria-hidden>✨</span>
        <span>Enhance</span>
      </button>

      <AIEnhancePanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onAccept={onAccept}
        onAcceptTranslation={onAcceptTranslation}
        sourceText={sourceText}
        locale={locale}
        fieldKind={fieldKind}
        fieldLabel={fieldLabel}
      />
    </>
  );
}
