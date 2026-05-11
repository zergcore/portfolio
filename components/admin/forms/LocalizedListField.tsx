"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

interface LocalizedListFieldProps {
  name: string;
  label: string;
  rows?: number;
  placeholder?: { en?: string; es?: string };
}

export default function LocalizedListField({
  name,
  label,
  rows = 5,
  placeholder = {},
}: LocalizedListFieldProps) {
  const [activeLocale, setActiveLocale] = useState<"en" | "es">("en");
  const { setValue, watch } = useFormContext();

  const enList: string[] = watch(`${name}.en`) ?? [];
  const esList: string[] = watch(`${name}.es`) ?? [];
  const activeList = activeLocale === "en" ? enList : esList;

  const handleChange = (raw: string) => {
    const lines = raw.split("\n");
    setValue(`${name}.${activeLocale}`, lines, { shouldDirty: true });
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>
        <div className="flex items-center gap-1">
          {(["en", "es"] as const).map((loc) => {
            const list = loc === "en" ? enList : esList;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => setActiveLocale(loc)}
                className={`px-2 py-0.5 rounded text-xs font-bold uppercase transition-colors ${
                  activeLocale === loc
                    ? "bg-[var(--accent-violet)] text-white"
                    : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {loc}
                {list.filter(Boolean).length === 0 && (
                  <span className="ml-1 text-[var(--color-warning)] text-[10px]">⚠</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <textarea
        value={activeList.join("\n")}
        onChange={(e) => handleChange(e.target.value)}
        rows={rows}
        placeholder={placeholder[activeLocale] ?? "One bullet per line"}
        className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none resize-none"
      />
      <p className="text-xs text-[var(--text-muted)]">One bullet point per line.</p>
    </div>
  );
}
