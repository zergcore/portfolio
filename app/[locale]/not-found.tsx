import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ArrowLeft, Briefcase, FileText } from "lucide-react";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="relative isolate flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-6 text-center">

      {/* GPU-Accelerated Background Elements 
        Hidden from screen readers to reduce cognitive load.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 select-none"
      >
        <div className="absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-cyan)]/10 blur-[120px] transform-gpu" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--accent-violet)]/10 blur-[120px] transform-gpu" />
      </div>

      {/* Semantic Grouping for the Error Message */}
      <header className="mb-10 flex flex-col items-center">
        <h1 className="select-none bg-[image:var(--gradient-brand)] bg-clip-text text-[8rem] font-black leading-none text-transparent md:text-[12rem]">
          404
        </h1>
        <h2 className="mb-4 mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)] md:mt-0 md:text-3xl">
          {t("title")}
        </h2>
        <p className="max-w-md text-base text-[var(--text-secondary)] md:text-lg">
          {t("description")}
        </p>
      </header>

      {/* Recruiter-Centric Recovery Navigation */}
      <nav className="flex w-full max-w-sm flex-col gap-4 sm:max-w-none sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          {t("backToHome")}
        </Link>

        {/* Secondary fallbacks to keep recruiters in the funnel */}
        <div className="flex gap-4 sm:gap-6">
          <Link
            href="/projects"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-medium text-[var(--text-primary)] backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-violet)]"
          >
            <Briefcase size={16} />
            {t("projects")}
          </Link>

          <Link
            href="/resume"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-medium text-[var(--text-primary)] backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-violet)]"
          >
            <FileText size={16} />
            {t("resume")}
          </Link>
        </div>
      </nav>

    </main>
  );
}
