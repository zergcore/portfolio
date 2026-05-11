"use client";

import { forwardRef } from "react";

interface DateFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
  ({ label, error, ...props }, ref) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[var(--text-secondary)]">
        {label}
      </label>
      <input
        ref={ref}
        type="date"
        {...props}
        className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  ),
);
DateField.displayName = "DateField";

export default DateField;
