import { getSetupStatus } from "@/lib/adminApi";
import { getTranslations } from "next-intl/server";
import SetupClient from "./SetupClient";

export const revalidate = 0;

interface ServiceStatus {
  key: string;
  configured: boolean;
  env_var: string;
  features: string[];
  setup_url: string;
  notes: string;
}

interface SetupData {
  services: ServiceStatus[];
  warnings: string[];
}

export default async function AdminSetupPage() {
  const data: SetupData | null = await getSetupStatus();
  const t = await getTranslations("adminSetup");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--text-primary)">
          {t("pageTitle")}
        </h1>
        <p className="text-(--text-secondary) mt-2">
          {t("pageDescription")}
        </p>
      </div>

      {data ? (
        <SetupClient services={data.services} />
      ) : (
        <div className="px-4 py-6 rounded-lg bg-red-500/10 border border-red-500/40 text-sm text-red-300">
          {t("fetchError")}
        </div>
      )}
    </div>
  );
}
