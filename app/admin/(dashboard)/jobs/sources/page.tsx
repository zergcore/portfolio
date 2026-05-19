import Link from "next/link";
import { getAdminJobPlatforms, getAdminJobSources } from "@/lib/adminApi";
import { ApiJobPlatform, ApiJobSource } from "@/lib/api";
import SourcesClient from "./SourcesClient";

export const revalidate = 0;

export default async function AdminJobSourcesPage() {
  const [sources, platforms] = await Promise.all([
    getAdminJobSources(),
    getAdminJobPlatforms(),
  ]);

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/admin/jobs"
        className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors"
      >
        ← Back to pipeline
      </Link>
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Job Sources</h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Configure which public job boards the daily poller fetches from.
          Each row is one (platform, identifier) pair — for Greenhouse/Lever
          the identifier is the company&apos;s board slug; for RemoteOK it&apos;s
          a tag (e.g. <code>python</code>).
        </p>
      </div>

      <SourcesClient
        initialSources={sources as ApiJobSource[]}
        platforms={platforms as ApiJobPlatform[]}
      />
    </div>
  );
}
