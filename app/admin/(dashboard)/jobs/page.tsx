import Link from "next/link";
import { getAdminJobs } from "@/lib/adminApi";
import { ApiJob } from "@/lib/api";
import JobsClient from "./JobsClient";

export const revalidate = 0;

export default async function AdminJobsPage() {
  const jobs = (await getAdminJobs({ limit: 500 })) as ApiJob[];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Job Pipeline
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Jobs found by the daily poller, scored against your profile. Move them
            through the pipeline and generate tailored applications.
          </p>
        </div>
        <Link
          href="/admin/jobs/sources"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-strong)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-colors"
        >
          Manage sources
        </Link>
      </div>

      <JobsClient initialJobs={jobs} />
    </div>
  );
}
