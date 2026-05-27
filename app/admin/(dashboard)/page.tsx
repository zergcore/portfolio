import Link from "next/link";
import GradientText from "@/components/typography/GradientText";
import { getProfile } from "@/lib/api";
import { quickLinks } from "@/lib/constants/dashboard";

export default async function AdminDashboardPage() {
  const profile = await getProfile();
  const displayName = profile?.name ? profile.name.split(" ")[0] : "Admin";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="mb-2 text-3xl font-bold text-[var(--text-primary)]">
          Welcome back, <GradientText>{displayName}</GradientText>
        </h1>
        <p className="text-[var(--text-secondary)]">
          Here is an overview of your portfolio content.
        </p>
      </header>

      <nav className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 transition-all hover:border-[var(--accent-violet)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-violet)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${link.bg} ${link.color}`}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-violet)]">
                {link.label}
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Add, edit, or remove entries.
              </p>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
