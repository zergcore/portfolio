"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

interface LocalizedTextFieldProps {
  name: string;
  label: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: { en?: string; es?: string };
  required?: boolean;
}

export default function LocalizedTextField({
  name,
  label,
  multiline = false,
  rows = 3,
  placeholder = {},
  required = false,
}: LocalizedTextFieldProps) {
  const [activeLocale, setActiveLocale] = useState<"en" | "es">("en");
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const enValue = watch(`${name}.en`) ?? "";
  const esValue = watch(`${name}.es`) ?? "";

  const fieldName = `${name}.${activeLocale}` as const;
  const error =
    (errors as Record<string, Record<string, Record<string, { message?: string }>>>)?.[name]?.[activeLocale]?.message;

  const inputClass =
    "w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none resize-none";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          {label}{required && " *"}
        </label>
        <div className="flex items-center gap-1">
          {(["en", "es"] as const).map((loc) => {
            const val = loc === "en" ? enValue : esValue;
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
                {val.length === 0 && (
                  <span className="ml-1 text-[var(--color-warning)] text-[10px]">⚠</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {multiline ? (
        <textarea
          {...register(fieldName)}
          rows={rows}
          placeholder={placeholder[activeLocale]}
          className={inputClass}
        />
      ) : (
        <input
          {...register(fieldName)}
          placeholder={placeholder[activeLocale]}
          className={inputClass}
        />
      )}

      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}
