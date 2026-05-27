import Link from "next/link";
import { getAdminJobs } from "@/lib/adminApi";
import { ApiJob } from "@/lib/api";
import { getTranslations } from "next-intl/server";
import JobsClient from "./JobsClient";

export const revalidate = 0;

export default async function AdminJobsPage() {
  const jobs = (await getAdminJobs({ limit: 100 })) as ApiJob[];
  const t = await getTranslations("adminJobs");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-(--text-primary)">
            {t("pageTitle")}
          </h1>
          <p className="text-(--text-secondary) mt-2">{t("pageDescription")}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/admin/jobs/history"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border-strong) text-sm font-medium text-(--text-primary) hover:border-(--accent-cyan) hover:text-(--accent-cyan) transition-colors"
          >
            {t("history")}
          </Link>
          <Link
            href="/admin/jobs/discover"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border-strong) text-sm font-medium text-(--text-primary) hover:border-(--accent-cyan) hover:text-(--accent-cyan) transition-colors"
          >
            {t("discover")}
          </Link>
          <Link
            href="/admin/jobs/sources"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border-strong) text-sm font-medium text-(--text-primary) hover:border-(--accent-cyan) hover:text-(--accent-cyan) transition-colors"
          >
            {t("manageSources")}
          </Link>
        </div>
      </div>

      <JobsClient initialJobs={jobs} />
    </div>
  );
}
