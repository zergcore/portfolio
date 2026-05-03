import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import Section from "@/components/ui/Section";
import ContactForm from "@/components/forms/ContactForm";
import { ArrowLeft, MapPin, Clock, Mail } from "lucide-react";
import { FaWhatsapp, FaLinkedin, FaGithub } from "react-icons/fa";

export const metadata = {
  title: "Contact | Zergcore.dev",
  description:
    "Get in touch with Zaidibeth Ramos — Senior Full-Stack Engineer. Available for new opportunities, freelance projects, and technical collaborations.",
};

const socialLinks = [
  {
    label: "WhatsApp",
    href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890"}`,
    icon: FaWhatsapp,
    color: "hover:text-green-400",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/zaidibethramos",
    icon: FaLinkedin,
    color: "hover:text-blue-400",
  },
  {
    label: "GitHub",
    href: "https://github.com/zergcore",
    icon: FaGithub,
    color: "hover:text-white",
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col">
        <Section id="contact" className="pt-32">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors mb-12"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Left: Info Column */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
                  Let&apos;s{" "}
                  <span className="text-transparent bg-clip-text bg-[image:var(--gradient-brand)]">
                    Connect
                  </span>
                </h1>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Whether you have a role to fill, a project to build, or just
                  want to say hello — I&apos;d love to hear from you.
                </p>
              </div>

              {/* Quick info */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <MapPin
                    size={16}
                    className="text-[var(--accent-cyan)] flex-shrink-0"
                  />
                  <span>Based in Venezuela · Open to remote worldwide</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Clock
                    size={16}
                    className="text-[var(--accent-cyan)] flex-shrink-0"
                  />
                  <span>UTC-4 · Usually responds within 24h</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Mail
                    size={16}
                    className="text-[var(--accent-cyan)] flex-shrink-0"
                  />
                  <span>hola@zergcore.dev</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <p className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-4">
                  Or reach out directly
                </p>
                <div className="flex gap-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
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

            {/* Right: Contact Form */}
            <div className="lg:col-span-3 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 md:p-10">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
                Send a Message
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
