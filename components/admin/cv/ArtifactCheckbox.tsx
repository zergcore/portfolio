export function ArtifactCheckbox(p: {
  checked: boolean;
  onChange: () => void;
  disabled: boolean;
  title: string;
  hint: string;
}) {
  return (
    <label
      className={`px-3 py-2.5 rounded-lg border text-left transition-colors flex items-start gap-2 cursor-pointer select-none ${
        p.checked
          ? "border-(--accent-primary) bg-(--accent-primary)/10 text-foreground"
          : "border-(--border-default) bg-(--bg-input) text-(--text-muted) hover:text-foreground"
      } ${p.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        type="checkbox"
        checked={p.checked}
        onChange={p.onChange}
        disabled={p.disabled}
        className="mt-1 accent-(--accent-primary)"
      />
      <span className="flex flex-col">
        <span className="text-sm font-semibold">{p.title}</span>
        <span className="text-xs mt-0.5 opacity-75">{p.hint}</span>
      </span>
    </label>
  );
}
