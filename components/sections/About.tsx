"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import { motion } from "framer-motion";
import { MapPin, Mail } from "lucide-react";
import { FaLinkedin, FaGithub, FaWhatsapp } from "react-icons/fa";
import { Profile } from "@/lib/api";

interface AboutProps {
  profile: Profile | null;
}

const defaultProfile: Profile = {
  name: "Zaidibeth Ramos",
  title: "Senior Full-Stack Engineer",
  bio: "Senior Full-Stack Engineer with a passion for building high-performance, scalable web applications. With expertise in the modern JavaScript and Python ecosystems, I focus on creating clean, efficient code and intuitive user experiences.\n\nMy approach combines rigorous engineering principles with a deep understanding of user behavior. Whether it's architecting a real-time currency engine or scaling a metaverse platform, I thrive on solving complex technical challenges that drive real business value.",
  email: "hola@zergcore.dev",
  location: "Venezuela · Remote Worldwide",
  githubUrl: "https://github.com/zergcore",
  linkedinUrl: "https://linkedin.com/in/zaidibethramos",
  imageUrl: undefined, // No default image
};

export default function About({ profile: apiProfile }: AboutProps) {
  const profile = apiProfile || defaultProfile;
  const t = useTranslations("about");

  return (
    <Section id="about" className="bg-[var(--bg-surface)] overflow-hidden">
      <Container>
        <div className={`grid grid-cols-1 ${profile.imageUrl ? 'lg:grid-cols-2' : 'max-w-3xl mx-auto'} gap-12 lg:gap-20 items-center`}>
          {/* Left: Image with decorative elements */}
          {profile.imageUrl && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Decorative background shape */}
              <div className="absolute -top-6 -left-6 w-full h-full border-2 border-[var(--accent-cyan)]/20 rounded-2xl z-0" />
              <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-[var(--accent-violet)]/20 rounded-2xl z-0" />

              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-subtle)] aspect-[4/5]">
                <Image
                  src={profile.imageUrl}
                  alt={profile.name}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Overlay info for mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold text-white">
                    {profile.name}
                  </h3>
                  <p className="text-[var(--accent-cyan)] font-medium">
                    {profile.title}
                  </p>
                </div>
              </div>

              {/* Years of Experience Badge - Only on Desktop */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-4 -left-4 z-20 bg-[var(--bg-elevated)]/90 backdrop-blur-md border border-[var(--border-subtle)] p-4 rounded-xl shadow-xl hidden lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[image:var(--gradient-brand)] flex items-center justify-center text-white font-bold text-xl">
                    6+
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold">
                      Years of
                    </p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      Experience
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Right: Content */}
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-sm uppercase tracking-[0.3em] font-bold text-[var(--accent-cyan)] mb-3">
                {t("label")}
              </h2>
              <h3 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] leading-tight mb-6">
                {t("headingMain")}{" "}
                <span className="text-transparent bg-clip-text bg-[image:var(--gradient-brand)]">
                  {t("headingHighlight")}
                </span>{" "}
                {t("headingSuffix")}
              </h3>
              <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed text-lg">
                {profile.bio.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </motion.div>

            {/* Info Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-[var(--border-subtle)]"
            >
              <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                <MapPin size={18} className="text-[var(--accent-cyan)]" />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                <Mail size={18} className="text-[var(--accent-cyan)]" />
                <span>{profile.email}</span>
              </div>
            </motion.div>

            {/* Social & CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 mt-4"
            >
              <div className="flex items-center gap-4">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white hover:border-white transition-all"
                  >
                    <FaGithub size={20} />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-blue-400 hover:border-blue-400 transition-all"
                  >
                    <FaLinkedin size={20} />
                  </a>
                )}
                {profile.whatsappNumber && (
                  <a
                    href={`https://wa.me/${profile.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-green-400 hover:border-green-400 transition-all"
                  >
                    <FaWhatsapp size={20} />
                  </a>
                )}
              </div>

              <div className="h-10 w-px bg-[var(--border-subtle)] hidden sm:block" />

              <a
                href={profile.cvUrl || "/resume.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] hover:text-[var(--accent-cyan)] transition-colors border-b-2 border-[var(--accent-cyan)] pb-1"
              >
                {t("viewResume")}
              </a>
            </motion.div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
