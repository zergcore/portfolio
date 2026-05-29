import Link from "next/link";
import {
  getAdminJobs,
  getAdminJobLocations,
  getAdminJobUniqueSources,
} from "@/lib/adminApi";
import { ApiJob } from "@/lib/api";
import { getTranslations } from "next-intl/server";
import JobsClient from "./JobsClient";
import JobFilters from "./JobFilters";

export const revalidate = 0;

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const q = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined;
  const location =
    typeof resolvedParams.location === "string"
      ? resolvedParams.location
      : undefined;
  const source =
    typeof resolvedParams.source === "string"
      ? resolvedParams.source
      : undefined;
  const remote = resolvedParams.remote === "true";
  const page =
    typeof resolvedParams.page === "string"
      ? parseInt(resolvedParams.page, 10)
      : 1;
  const limit = 50;
  const offset = (Math.max(1, page) - 1) * limit;

  const [data, locations, sources] = await Promise.all([
    getAdminJobs({
      limit,
      offset,
      q,
      location,
      source,
      remote: remote || undefined,
    }),
    getAdminJobLocations(),
    getAdminJobUniqueSources(),
  ]);

  const jobs = (data as { items: ApiJob[]; total: number })?.items || [];
  const total = (data as { items: ApiJob[]; total: number })?.total || 0;
  const t = await getTranslations("adminJobs");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("pageTitle")}
          </h1>
          <p className="text-(--text-secondary) mt-2">{t("pageDescription")}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/admin/jobs/history"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border-strong) text-sm font-medium text-foreground hover:border-(--accent-cyan) hover:text-(--accent-cyan) transition-colors"
          >
            {t("history")}
          </Link>
          <Link
            href="/admin/jobs/discover"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border-strong) text-sm font-medium text-foreground hover:border-(--accent-cyan) hover:text-(--accent-cyan) transition-colors"
          >
            {t("discover")}
          </Link>
          <Link
            href="/admin/jobs/sources"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border-strong) text-sm font-medium text-foreground hover:border-(--accent-cyan) hover:text-(--accent-cyan) transition-colors"
          >
            {t("manageSources")}
          </Link>
        </div>
      </div>

      <JobFilters locations={locations} sources={sources} />
      <JobsClient
        initialJobs={jobs}
        totalJobs={total}
        currentPage={page}
        limit={limit}
      />
    </div>
  );
}
