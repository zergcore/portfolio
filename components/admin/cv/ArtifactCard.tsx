import { LANG_LABEL } from "@/lib/constants/cv";

interface ArtifactCardProps {
  kind: "cv" | "cover_letter";
  title: string;
  locale: "en" | "es";
  detectedLanguage: string;
  identifier: string;
  html: string;
  warning: string | null;
  pdfUrl: string | null;
  pdfLoading: boolean;
  onDownload: () => void;
  body?: string;
  copied?: boolean;
  onCopy?: () => void;
}

export function ArtifactCard(p: ArtifactCardProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-semibold text-foreground">{p.title}</h2>
        <div className="text-xs text-(--text-muted) flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-(--accent-primary)/10 text-(--accent-primary) font-medium">
            Output: {LANG_LABEL[p.locale]}
          </span>
          <span>•</span>
          <span>
            Detected:{" "}
            {LANG_LABEL[p.detectedLanguage as "en" | "es"] ??
              p.detectedLanguage}
          </span>
          <span>•</span>
          <code className="text-(--accent-cyan)">
            {p.identifier.slice(0, 8)}
          </code>
        </div>
      </div>
      {p.warning && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-sm text-yellow-700 dark:text-yellow-400">
          <span className="font-semibold">Note: </span>
          {p.warning}
        </div>
      )}
      <div className="flex items-center gap-3 flex-wrap">
        {p.pdfUrl ? (
          <a
            href={p.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-lg bg-(--accent-primary) text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Download PDF
          </a>
        ) : (
          <button
            onClick={p.onDownload}
            disabled={p.pdfLoading}
            className="px-5 py-2 rounded-lg bg-(--accent-primary) text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
          >
            {p.pdfLoading ? (
              <>
                <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                Rendering PDF…
              </>
            ) : (
              "Download PDF"
            )}
          </button>
        )}
        {p.kind === "cover_letter" && p.onCopy && (
          <button
            onClick={p.onCopy}
            className="px-4 py-2 rounded-lg border border-(--border-default) text-sm text-(--text-secondary) hover:text-foreground transition-colors"
          >
            {p.copied ? "✓ Copied" : "Copy text"}
          </button>
        )}
      </div>
      {p.kind === "cover_letter" && p.body && (
        <div>
          <label className="block text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-1">
            Plain text (for messages, email body, etc.)
          </label>
          <textarea
            readOnly
            rows={Math.min(14, Math.max(6, p.body.split("\n").length + 2))}
            value={p.body}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full bg-(--bg-input) border border-(--border-default) rounded-lg px-3 py-2 text-sm text-foreground font-mono"
          />
        </div>
      )}
      <div className="bg-(--bg-elevated) rounded-xl border border-(--border-default) overflow-hidden">
        <div className="px-4 py-2 border-b border-(--border-default)">
          <p className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider">
            {p.title} preview
          </p>
        </div>
        <iframe
          srcDoc={p.html}
          title={`${p.title} preview`}
          className="w-full h-[600px] bg-white"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
