import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import Section from "@/components/ui/Section";
import ContactForm from "@/components/forms/ContactForm";
import BookACallButton from "@/components/ui/BookACallButton";
import { getProfile } from "@/lib/api";
import { ArrowLeft, MapPin, Clock, Mail } from "lucide-react";
import { FaWhatsapp, FaLinkedin, FaGithub } from "react-icons/fa";

const socialLinks = [
  {
    key: "whatsapp",
    href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890"}`,
    icon: FaWhatsapp,
    color: "hover:text-green-400",
    label: "WhatsApp",
  },
  {
    key: "linkedin",
    href: "https://linkedin.com/in/zaidibethramos",
    icon: FaLinkedin,
    color: "hover:text-blue-400",
    label: "LinkedIn",
  },
  {
    key: "github",
    href: "https://github.com/zergcore",
    icon: FaGithub,
    color: "hover:text-white",
    label: "GitHub",
  },
];

export async function generateMetadata() {
  const t = await getTranslations("contact");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ContactPage() {
  const [t, profile] = await Promise.all([
    getTranslations("contact"),
    getProfile(),
  ]);

  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col">
        <Section id="contact" className="pt-32">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors mb-12"
          >
            <ArrowLeft size={14} />
            {t("backToHome")}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
                  {t("pageHeading")}{" "}
                  {t("pageHeadingHighlight") && (
                    <span className="text-transparent bg-clip-text bg-[image:var(--gradient-brand)]">
                      {t("pageHeadingHighlight")}
                    </span>
                  )}
                </h1>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {t("pageDescription")}
                </p>
                {profile?.meetingUrl && (
                  <div className="mt-6">
                    <BookACallButton href={profile.meetingUrl} />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <MapPin size={16} className="text-[var(--accent-cyan)] flex-shrink-0" />
                  <span>{t("location")}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Clock size={16} className="text-[var(--accent-cyan)] flex-shrink-0" />
                  <span>{t("timezone")}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Mail size={16} className="text-[var(--accent-cyan)] flex-shrink-0" />
                  <span>{t("email")}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <p className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-4">
                  {t("reachOut")}
                </p>
                <div className="flex gap-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.key}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] ${link.color} transition-colors`}
                      aria-label={link.label}
                    >
                      <link.icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 md:p-10">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
                {t("sendMessage")}
              </h2>
              <ContactForm />
            </div>
          </div>
        </Section>
      </main>

      <WhatsAppFAB />
      <Footer />
    </>
  );
}
