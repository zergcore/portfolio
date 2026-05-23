import Link from "next/link";
import { getAdminJobSources } from "@/lib/adminApi";
import { ApiJobSource } from "@/lib/api";
import DiscoverClient from "./DiscoverClient";

export const revalidate = 0;

export default async function DiscoverPage() {
  const existing = (await getAdminJobSources()) as ApiJobSource[];

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/admin/jobs/sources"
        className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors"
      >
        ← Back to sources
      </Link>
      <div className="mb-8 mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Discover companies</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Paste company names — one per line — and we probe every known ATS
            (Greenhouse, Lever, Ashby, Recruitee, SmartRecruiters) in parallel.
            Each match is one click away from becoming a tracked source.
          </p>
        </div>
        <Link
          href="/admin/jobs/discover/inbox"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-strong)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-colors"
        >
          Inbox →
        </Link>
      </div>

      <DiscoverClient existingSources={existing} />
    </div>
  );
}
