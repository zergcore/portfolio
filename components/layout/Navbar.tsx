"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Menu, X } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const t = useTranslations("nav");

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const navLinks = [
    { key: "about", href: "/#about" as const },
    { key: "projects", href: "/#projects" as const },
    { key: "skills", href: "/#skills" as const },
    { key: "experience", href: "/#experience" as const },
    { key: "contact", href: "/contact" as const },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-subtle)] py-3 shadow-md"
          : "bg-transparent py-5"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Container className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="font-mono font-bold text-xl tracking-tighter text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
            &lt;zr/&gt;
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-sm px-1"
                >
                  {t(link.key as "about" | "projects" | "skills" | "experience" | "contact")}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <Button href="/resume.pdf" variant="outline" size="sm" className="hidden lg:inline-flex">
              {t("resume")}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-md"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </Container>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] shadow-lg p-4 flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 px-4 rounded-md text-[var(--text-primary)] font-medium hover:bg-[var(--bg-elevated)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  {t(link.key as "about" | "projects" | "skills" | "experience" | "contact")}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3 mt-2">
            <LocaleSwitcher />
            <Button href="/resume.pdf" variant="primary" size="md" className="flex-1">
              {t("downloadResume")}
            </Button>
          </div>
        </div>
      )}
    </motion.header>
  );
}
