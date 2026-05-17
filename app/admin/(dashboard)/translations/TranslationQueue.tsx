"use client";

import { useRef, useState, useTransition } from "react";
import { skipFieldAction, saveTranslationAction, QueueItem } from "@/app/actions/translations";
import { streamRewrite } from "@/lib/aiStream";

const FIELD_KIND: Record<string, "title" | "paragraph" | "bullet"> = {
  title:       "title",
  bio:         "paragraph",
  location:    "title",
  role:        "title",
  description: "paragraph",
  degree:      "title",
  problem:     "paragraph",
  outcomes:    "paragraph",
  name:        "title",
  excerpt:     "paragraph",
  content:     "paragraph",
};

const ENTITY_LABELS: Record<string, string> = {
  profiles:         "Profile",
  experiences:      "Experience",
  education:        "Education",
  projects:         "Project",
  blog_posts:       "Blog Post",
  skill_categories: "Skill Category",
};

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  bio: "Bio",
  location: "Location",
  role: "Role",
  description: "Description",
  degree: "Degree",
  problem: "Problem",
  outcomes: "Outcomes",
  name: "Name",
  excerpt: "Excerpt",
  content: "Content",
};

function QueueRow({ item, onDone }: { item: QueueItem; onDone: () => void }) {
  const [esText, setEsText] = useState(item.draft_text || item.es_current || "");
  const [status, setStatus] = useState<"idle" | "translating" | "saving" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [, startTransition] = useTransition();
  const abortRef = useRef<AbortController | null>(null);

  const handleTranslate = () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setStatus("translating");
    setErrorMsg("");
    setEsText("");

    streamRewrite({
      text: item.en_text,
      locale: "en",
      fieldKind: FIELD_KIND[item.field] ?? "paragraph",
      mode: "translate",
      targetLocale: "es",
      signal: abortRef.current.signal,
      onChunk: (chunk) => setEsText((prev) => prev + chunk),
      onDone: () => setStatus("idle"),
      onError: (msg) => {
        setErrorMsg(msg);
        setStatus("error");
      },
    });
  };

  const handleSave = () => {
    if (!esText.trim()) return;
    setStatus("saving");
    setErrorMsg("");
    startTransition(async () => {
      const result = await saveTranslationAction(item.entity, item.record_id, item.field, esText);
      if (result.success) {
        setStatus("done");
        onDone();
      } else {
        setErrorMsg(result.error ?? "Save failed");
        setStatus("error");
      }
    });
  };

  const handleSkip = () => {
    abortRef.current?.abort();
    startTransition(async () => {
      await skipFieldAction(item.entity, item.record_id, item.field);
      onDone();
    });
  };

  if (status === "done") return null;

  return (
    <div className="border border-[var(--border-default)] rounded-xl p-4 space-y-3 bg-[var(--bg-surface)]">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-0.5 rounded-md bg-[var(--accent-violet)]/10 text-[var(--accent-violet)] font-medium text-xs">
            {ENTITY_LABELS[item.entity] ?? item.entity}
          </span>
          <span className="text-[var(--text-muted)]">{item.label}</span>
          <span className="text-[var(--text-muted)]">/</span>
          <span className="font-medium text-[var(--text-primary)]">
            {FIELD_LABELS[item.field] ?? item.field}
          </span>
        </div>
        <button
          onClick={handleSkip}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-1">English (source)</p>
          <div className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-3 text-sm text-[var(--text-secondary)] min-h-[80px] whitespace-pre-wrap">
            {item.en_text || <em className="text-[var(--text-muted)]">empty</em>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-[var(--text-muted)]">Spanish (draft)</p>
            {status === "translating" && (
              <span className="text-xs text-[var(--accent-violet)] animate-pulse">Translating…</span>
            )}
          </div>
          <textarea
            value={esText}
            onChange={(e) => setEsText(e.target.value)}
            disabled={status === "translating"}
            rows={4}
            className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg p-3 text-sm text-[var(--text-primary)] resize-y focus:outline-none focus:border-[var(--accent-violet)] transition-colors disabled:opacity-70"
            placeholder="Spanish translation…"
          />
        </div>
      </div>

      {status === "error" && (
        <p className="text-xs text-[var(--color-error)]">{errorMsg}</p>
      )}

      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={handleTranslate}
          disabled={status === "translating" || status === "saving"}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-50 transition-colors"
        >
          {status === "translating" ? "Translating…" : "Translate with AI"}
        </button>
        <button
          onClick={handleSave}
          disabled={!esText.trim() || status === "translating" || status === "saving"}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent-violet)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {status === "saving" ? "Saving…" : "Save & publish"}
        </button>
      </div>
    </div>
  );
}

export default function TranslationQueue({ initialItems }: { initialItems: QueueItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [entityFilter, setEntityFilter] = useState<string>("all");

  const visibleItems = entityFilter === "all"
    ? items
    : items.filter((i) => i.entity === entityFilter);

  const entities = [...new Set(initialItems.map((i) => i.entity))];

  const markDone = (item: QueueItem) => {
    setItems((prev) => prev.filter((i) => !(i.entity === item.entity && i.record_id === item.record_id && i.field === item.field)));
  };

  return (
    <div className="space-y-4">
      {entities.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEntityFilter("all")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              entityFilter === "all"
                ? "bg-[var(--accent-violet)] text-white"
                : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            All ({items.length})
          </button>
          {entities.map((ent) => (
            <button
              key={ent}
              onClick={() => setEntityFilter(ent)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                entityFilter === ent
                  ? "bg-[var(--accent-violet)] text-white"
                  : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {ENTITY_LABELS[ent] ?? ent} ({items.filter((i) => i.entity === ent).length})
            </button>
          ))}
        </div>
      )}

      {visibleItems.length === 0 ? (
        <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] p-8 text-center">
          <p className="text-[var(--text-muted)] text-sm">
            {items.length === 0
              ? "All fields have Spanish translations."
              : "No items match the current filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleItems.map((item) => (
            <QueueRow
              key={`${item.entity}-${item.record_id}-${item.field}`}
              item={item}
              onDone={() => markDone(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
