import { getSetupStatus } from "@/lib/adminApi";
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Setup Status
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Check which API keys and services are configured. Missing keys
          will disable the features that depend on them.
        </p>
      </div>

      {data ? (
        <SetupClient services={data.services} />
      ) : (
        <div className="px-4 py-6 rounded-lg bg-red-500/10 border border-red-500/40 text-sm text-red-300">
          Failed to load setup status. Make sure you are logged in and the
          backend is running.
        </div>
      )}
    </div>
  );
}
