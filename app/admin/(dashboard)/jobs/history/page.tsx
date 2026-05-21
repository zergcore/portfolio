import Link from "next/link";
import { getAdminJobHistory } from "@/lib/adminApi";
import { ApiJob } from "@/lib/api";
import HistoryClient from "./HistoryClient";

export const revalidate = 0;

export default async function JobHistoryPage() {
  const jobs = (await getAdminJobHistory()) as ApiJob[];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Application History
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Every job you have tailored or applied to, most recent activity first.
          </p>
        </div>
        <Link
          href="/admin/jobs"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-strong)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-colors"
        >
          ← Pipeline
        </Link>
      </div>

      <HistoryClient initialJobs={jobs} />
    </div>
  );
}
