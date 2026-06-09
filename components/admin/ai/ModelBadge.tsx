import { AiModelEntry } from "@/lib/types/ai";
import { useTranslations } from "next-intl";

export function ModelBadge({ entry }: { entry: AiModelEntry }) {
  const t = useTranslations("adminAiConfig");
  const shortModel = entry.model.split("/").pop() ?? entry.model;

  if (!entry.skipped) {
    return (
      <div className="rounded border border-green-500/40 bg-green-500/10 px-2 py-1 text-xs min-w-0">
        <div className="font-medium text-green-400 truncate">
          {entry.provider}
        </div>
        <div className="text-green-600 truncate" title={entry.model}>
          {shortModel}
        </div>
      </div>
    );
  }

  if (entry.reason === "rate_limited") {
    const remaining = entry.until
      ? Math.max(0, entry.until - Math.floor(Date.now() / 1000))
      : 0;
    const mins = Math.ceil(remaining / 60);
    return (
      <div className="rounded border border-orange-500/40 bg-orange-500/10 px-2 py-1 text-xs min-w-0">
        <div className="font-medium text-orange-400 truncate">
          {entry.provider}
        </div>
        <div className="text-orange-600 truncate" title={entry.model}>
          {shortModel}
        </div>
        <div className="text-orange-500 text-[10px]">
          {t("badges.rateLimited")} {mins}m
        </div>
      </div>
    );
  }

  const label =
    entry.reason === "missing_key" ? t("badges.noKey") : t("badges.badModel");
  return (
    <div className="rounded border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs min-w-0">
      <div className="font-medium text-red-400 truncate">{entry.provider}</div>
      <div className="text-red-600 truncate" title={entry.model}>
        {shortModel}
      </div>
      <div className="text-red-500 text-[10px]">{label}</div>
    </div>
  );
}
