import { getAiConfig, getAiKnownModels } from "@/lib/adminApi";
import type { AiConfigData, AiKnownModel } from "@/lib/types/ai";
import { getTranslations } from "next-intl/server";
import AiConfigClient from "./AiConfigClient";

export const revalidate = 0;

export default async function AiConfigPage() {
  const t = await getTranslations("adminAiConfig");
  const [config, knownModels] = await Promise.all([
    getAiConfig() as Promise<AiConfigData | null>,
    getAiKnownModels() as Promise<AiKnownModel[] | null>,
  ]);

  return (
    <div className="p-6 max-w-full space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">{t("pageTitle")}</h1>
        <p className="text-sm text-(--text-muted)">
          {t("pageDescription")}
        </p>
      </div>
      <AiConfigClient config={config ?? {}} knownModels={knownModels ?? []} />
    </div>
  );
}
