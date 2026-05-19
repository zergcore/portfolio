import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminJob } from "@/lib/adminApi";
import { ApiJob } from "@/lib/api";
import JobDetailClient from "./JobDetailClient";

export const revalidate = 0;

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = (await getAdminJob(id)) as ApiJob | null;
  if (!job) notFound();

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/admin/jobs"
        className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors"
      >
        ← Back to pipeline
      </Link>
      <JobDetailClient initialJob={job} />
    </div>
  );
}
