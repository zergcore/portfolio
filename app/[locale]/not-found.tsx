import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-cyan)] opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-violet)] opacity-10 rounded-full blur-3xl" />
      </div>

      <h1 className="text-[8rem] md:text-[12rem] font-black leading-none text-transparent bg-clip-text bg-[image:var(--gradient-brand)] select-none">
        404
      </h1>

      <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4 -mt-4">
        {t("title")}
      </h2>

      <p className="text-[var(--text-secondary)] max-w-md mb-10">
        {t("description")}
      </p>

      <Link
        href="/"
        className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[image:var(--gradient-brand)] text-white font-semibold text-sm transition-all duration-300 hover:opacity-90 shadow-lg"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        {t("backToHome")}
      </Link>
    </div>
  );
}
