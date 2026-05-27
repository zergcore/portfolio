"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  skipFieldAction,
  saveTranslationAction,
  QueueItem,
} from "@/app/actions/translations";
import { streamRewrite } from "@/lib/aiStream";

const FIELD_KIND: Record<string, "title" | "paragraph" | "bullet"> = {
  title: "title",
  bio: "paragraph",
  location: "title",
  role: "title",
  description: "paragraph",
  degree: "title",
  problem: "paragraph",
  outcomes: "paragraph",
  name: "title",
  excerpt: "paragraph",
  content: "paragraph",
};

const LOCALE_LABEL: Record<string, string> = { en: "English", es: "Español" };

function QueueRow({ item, onDone }: { item: QueueItem; onDone: () => void }) {
  const tFilters = useTranslations("adminTranslations.filters");
  const tFields = useTranslations("adminTranslations.fields");
  const t = useTranslations("adminTranslations.queue");

  const [targetText, setTargetText] = useState(
    item.draft_text || item.current_text || "",
  );
  const [status, setStatus] = useState<
    "idle" | "translating" | "saving" | "done" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [, startTransition] = useTransition();
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestKeepAsIs = item.source_text.trim().split(/\s+/).length === 1;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [targetText]);

  const handleTranslate = () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setStatus("translating");
    setErrorMsg("");
    setTargetText("");

    streamRewrite({
      text: item.source_text,
      locale: item.source_locale,
      fieldKind: FIELD_KIND[item.field] ?? "paragraph",
      mode: "translate",
      targetLocale: item.target_locale,
      signal: abortRef.current.signal,
      onChunk: (chunk) => setTargetText((prev) => prev + chunk),
      onDone: () => setStatus("idle"),
      onError: (msg) => {
        setErrorMsg(msg);
        setStatus("error");
      },
    });
  };

  const handleSave = () => {
    if (!targetText.trim()) return;
    setStatus("saving");
    setErrorMsg("");
    startTransition(async () => {
      const result = await saveTranslationAction(
        item.entity,
        item.record_id,
        item.field,
        item.source_locale,
        item.source_text,
        item.target_locale,
        targetText,
        item.is_list,
      );
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
      await skipFieldAction(
        item.entity,
        item.record_id,
        item.field,
        item.target_locale,
      );
      onDone();
    });
  };

  if (status === "done") return null;

  const entityLabel = tFilters(item.entity) || item.entity;
  const fieldLabel = tFields(item.field) || item.field;

  return (
    <div className="border border-(--border-default) rounded-xl p-4 space-y-3 bg-(--bg-surface)">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-0.5 rounded-md bg-(--accent-violet)/10 text-(--accent-violet) font-medium text-xs">
            {entityLabel}
          </span>
          <span className="text-(--text-muted)">{item.label}</span>
          <span className="text-(--text-muted)">/</span>
          <span className="font-medium text-(--text-primary)">
            {fieldLabel}
          </span>
        </div>
        <button
          onClick={handleSkip}
          className="text-xs text-(--text-muted) hover:text-(--text-secondary) transition-colors"
        >
          {t("skip")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs text-(--text-muted)">
              {LOCALE_LABEL[item.source_locale] || item.source_locale} (
              {t("source")})
            </p>
            {suggestKeepAsIs && (
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-(--accent-amber)/10 text-(--accent-amber) font-medium">
                {t("singleWordHint")}
              </span>
            )}
          </div>
          <div className="bg-(--bg-base) border border-(--border-subtle) rounded-lg p-3 text-sm text-(--text-secondary) min-h-[80px] max-h-64 overflow-y-auto whitespace-pre-wrap">
            {item.source_text || <em className="text-(--text-muted)">empty</em>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-(--text-muted)">
              {LOCALE_LABEL[item.target_locale] || item.target_locale} (
              {t("translation")})
            </p>
            {status === "translating" && (
              <span className="text-xs text-(--accent-violet) animate-pulse">
                {t("translating")}
              </span>
            )}
          </div>
          <textarea
            ref={textareaRef}
            value={targetText}
            onChange={(e) => setTargetText(e.target.value)}
            disabled={status === "translating"}
            rows={4}
            className="w-full bg-(--bg-base) border border-(--border-default) rounded-lg p-3 text-sm text-(--text-primary) resize-none focus:outline-none focus:border-(--accent-violet) transition-colors disabled:opacity-70 overflow-y-auto max-h-64"
            placeholder={`${LOCALE_LABEL[item.target_locale] || item.target_locale} ${t("translationPlaceholder")}`}
          />
        </div>
      </div>

      {status === "error" && (
        <p className="text-xs text-(--color-error)">{errorMsg}</p>
      )}

      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={() => {
            abortRef.current?.abort();
            setTargetText(item.source_text);
            setStatus("idle");
            setErrorMsg("");
          }}
          disabled={status === "translating" || status === "saving"}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border disabled:opacity-50 transition-colors ${
            suggestKeepAsIs
              ? "border-(--accent-amber)/40 text-(--accent-amber) hover:bg-(--accent-amber)/10"
              : "border-(--border-default) text-(--text-muted) hover:text-(--text-secondary) hover:bg-(--bg-elevated)"
          }`}
        >
          {t("keepAsIs")}
        </button>
        <button
          onClick={handleTranslate}
          disabled={status === "translating" || status === "saving"}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-(--border-default) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-elevated) disabled:opacity-50 transition-colors"
        >
          {status === "translating" ? t("translating") : t("translateWithAI")}
        </button>
        <button
          onClick={handleSave}
          disabled={
            !targetText.trim() ||
            status === "translating" ||
            status === "saving"
          }
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-(--accent-violet) text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {status === "saving" ? t("saving") : t("saveAndPublish")}
        </button>
      </div>
    </div>
  );
}

export default function TranslationQueue({
  initialItems,
}: {
  initialItems: QueueItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const tFilters = useTranslations("adminTranslations.filters");
  const t = useTranslations("adminTranslations.queue");

  const visibleItems =
    entityFilter === "all"
      ? items
      : items.filter((i) => i.entity === entityFilter);

  const entities = [...new Set(initialItems.map((i) => i.entity))];

  const markDone = (item: QueueItem) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.entity === item.entity &&
            i.record_id === item.record_id &&
            i.field === item.field
          ),
      ),
    );
  };

  return (
    <div className="space-y-4">
      {entities.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEntityFilter("all")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              entityFilter === "all"
                ? "bg-(--accent-violet) text-white"
                : "bg-(--bg-elevated) text-(--text-secondary) hover:text-(--text-primary)"
            }`}
          >
            {tFilters("all")} ({items.length})
          </button>
          {entities.map((ent) => (
            <button
              key={ent}
              onClick={() => setEntityFilter(ent)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                entityFilter === ent
                  ? "bg-(--accent-violet) text-white"
                  : "bg-(--bg-elevated) text-(--text-secondary) hover:text-(--text-primary)"
              }`}
            >
              {tFilters(ent) || ent} (
              {items.filter((i) => i.entity === ent).length})
            </button>
          ))}
        </div>
      )}

      {visibleItems.length === 0 ? (
        <div className="bg-(--bg-elevated) rounded-xl border border-(--border-default) p-8 text-center">
          <p className="text-(--text-muted) text-sm">
            {items.length === 0 ? t("emptyQueue") : t("noMatches")}
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
