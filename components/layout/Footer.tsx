import Link from "next/link";
import Container from "@/components/ui/Container";
import MediaButtons from "@/components/Buttons/MediaButtons";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)]">
      <Container className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="font-mono font-bold text-lg text-[var(--text-primary)] hover:text-[var(--accent-cyan)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-sm">
            &lt;zr/&gt;
          </Link>
          <p className="text-sm text-[var(--text-muted)] text-center md:text-left">
            Building scalable systems & intelligent interfaces.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <MediaButtons filter={["LinkedIn Profile", "GitHub Profile", "Send an email"]} />
        </div>

        <div className="flex flex-col items-center md:items-end gap-2 text-sm text-[var(--text-muted)]">
          <p>&copy; {currentYear} Zaidibeth Ramos. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/contact" className="hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-sm">Contact</Link>
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-sm">Resume</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
