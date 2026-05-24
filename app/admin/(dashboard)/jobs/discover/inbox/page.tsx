import Link from "next/link";
import InboxClient from "./InboxClient";

export const revalidate = 0;

export default function DiscoveryInboxPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/admin/jobs/discover"
        className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors"
      >
        ← Back to Discover
      </Link>
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Discovery inbox</h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Company slugs harvested from Google Custom Search across the supported ATS
          hosts. Promote ones you want to track, dismiss the rest.
        </p>
      </div>

      <InboxClient />
    </div>
  );
}
