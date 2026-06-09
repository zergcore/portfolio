import { QaAnswerResponse } from "@/lib/adminApi";
import { LANG_LABEL } from "@/lib/constants/cv";
import { QaPairCard } from "./QAPairCard";

export function QaCard(p: {
  session: QaAnswerResponse;
  locale: "en" | "es";
  copyStatus: Record<string, boolean>;
  onCopy: (idx: number, text: string) => void;
  onRegenerate: (idx: number, hint: string) => Promise<void>;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-semibold text-foreground">
          Application Q&amp;A
        </h2>
        <div className="text-xs text-(--text-muted) flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-(--accent-primary)/10 text-(--accent-primary) font-medium">
            Output: {LANG_LABEL[p.locale]}
          </span>
          <span>•</span>
          <span>
            Detected:{" "}
            {LANG_LABEL[p.session.detected_language as "en" | "es"] ??
              p.session.detected_language}
          </span>
          <span>•</span>
          <code className="text-(--accent-cyan)">
            {p.session.qa_session_id.slice(0, 8)}
          </code>
        </div>
      </div>

      <div className="space-y-3">
        {p.session.answers.map((pair, i) => (
          <QaPairCard
            key={`${p.session.qa_session_id}-${i}`}
            index={i}
            pair={pair}
            copied={!!p.copyStatus[`qa_${i}`]}
            onCopy={(text) => p.onCopy(i, text)}
            onRegenerate={(hint) => p.onRegenerate(i, hint)}
          />
        ))}
      </div>
    </div>
  );
}
