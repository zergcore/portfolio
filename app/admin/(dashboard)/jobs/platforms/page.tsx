import Link from "next/link";
import { getAdminPlatformConfigs } from "@/lib/adminApi";
import { ApiJobPlatformConfig } from "@/lib/api";
import PlatformConfigsClient from "./PlatformConfigsClient";

export const revalidate = 0;

export default async function AdminPlatformConfigsPage() {
  const configs = await getAdminPlatformConfigs();

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/admin/jobs/sources"
        className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors"
      >
        &larr; Back to sources
      </Link>
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Platform Adapters
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Add new ATS platforms by describing their public JSON API &mdash; no
          code deploy needed. Each config teaches the poller how to fetch and
          parse jobs from a new platform type.
        </p>
      </div>

      <PlatformConfigsClient
        initialConfigs={configs as ApiJobPlatformConfig[]}
      />
    </div>
  );
}
