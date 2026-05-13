import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import Container from "@/components/ui/Container";
import MediaButtons from "@/components/buttons/MediaButtons";

export default async function Footer() {
  const [t, currentYear] = await Promise.all([
    getTranslations("footer"),
    Promise.resolve(new Date().getFullYear()),
  ]);

  return (
    <footer className="w-full py-8 mt-auto border-t border-(--border-subtle) bg-background text-(--text-secondary)">
      <Container className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link
            href="/"
            className="font-mono font-bold text-lg text-foreground hover:text-(--accent-cyan) transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-sm"
          >
            &lt;zr/&gt;
          </Link>
          <p className="text-sm text-(--text-muted) text-center md:text-left">
            {t("tagline")}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <MediaButtons
            filter={["LinkedIn Profile", "GitHub Profile", "Send an email"]}
          />
        </div>

        <div className="flex flex-col items-center md:items-end gap-2 text-sm text-(--text-muted)">
          <p>&copy; {currentYear} Zaidibeth Ramos. {t("copyright")}</p>
          <div className="flex gap-4">
            <Link
              href="/contact"
              className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-sm"
            >
              {t("contact")}
            </Link>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-sm"
            >
              {t("resume")}
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
