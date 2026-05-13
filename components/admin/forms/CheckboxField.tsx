"use client";

import { forwardRef } from "react";

interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, error, ...props }, ref) => (
    <div className="space-y-1">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          ref={ref}
          type="checkbox"
          {...props}
          className="w-4 h-4 rounded border-[var(--border-default)] accent-[var(--accent-violet)] cursor-pointer"
        />
        <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
      </label>
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  ),
);
CheckboxField.displayName = "CheckboxField";

export default CheckboxField;
