import { getAiConfig, getAiKnownModels } from "@/lib/adminApi";
import type { AiConfigData, AiKnownModel } from "@/lib/types/ai";
import AiConfigClient from "./AiConfigClient";

export const revalidate = 0;

export default async function AiConfigPage() {
  const [config, knownModels] = await Promise.all([
    getAiConfig() as Promise<AiConfigData | null>,
    getAiKnownModels() as Promise<AiKnownModel[] | null>,
  ]);

  return (
    <div className="p-6 max-w-full space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">AI Model Config</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Live routing chain per feature. Skip status reflects this worker&apos;s in-process state.
        </p>
      </div>
      <AiConfigClient config={config ?? {}} knownModels={knownModels ?? []} />
    </div>
  );
}
