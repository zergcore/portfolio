import Link from "next/link";
import { getTranslations } from "next-intl/server";
import GradientText from "@/components/typography/GradientText";
import { getProfile } from "@/lib/api";
import { quickLinks } from "@/lib/constants/dashboard";

export default async function AdminDashboardPage() {
  const profile = await getProfile();
  const displayName = profile?.name ? profile.name.split(" ")[0] : "Admin";
  const t = await getTranslations("adminDashboard");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          {t.rich("welcomeBack", {
            name: displayName,
            nameComponent: (chunks) => <GradientText>{chunks}</GradientText>,
          })}
        </h1>
        <p className="text-(--text-secondary)">{t("overview")}</p>
      </header>

      <nav className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-(--border-default) bg-(--bg-elevated) p-6 transition-all hover:border-(--accent-violet) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-violet) focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${link.bg} ${link.color}`}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-(--accent-violet)">
                {t(`quickLinks.${link.labelKey}`)}
              </h3>
              <p className="mt-1 text-sm text-(--text-secondary)">
                {t("actionDesc")}
              </p>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
