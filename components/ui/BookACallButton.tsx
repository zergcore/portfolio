import { getTranslations } from "next-intl/server";
import { Calendar } from "lucide-react";

interface Props {
  href: string;
}

export default async function BookACallButton({ href }: Props) {
  const t = await getTranslations("contact");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[image:var(--gradient-brand)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
    >
      <Calendar size={16} />
      {t("bookACall")}
    </a>
  );
}
