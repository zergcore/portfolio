export function ModeCard(p: {
  active: boolean;
  onClick: () => void;
  disabled: boolean;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={p.onClick}
      disabled={p.disabled}
      className={`px-4 py-3 rounded-lg border text-left transition-colors disabled:opacity-50 ${
        p.active
          ? "border-(--accent-primary) bg-(--accent-primary)/10 text-foreground"
          : "border-(--border-default) bg-(--bg-input) text-(--text-muted) hover:text-foreground"
      }`}
    >
      <div className="text-sm font-semibold">{p.title}</div>
      <div className="text-xs mt-0.5 opacity-75">{p.hint}</div>
    </button>
  );
}
