import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ArrowRight, MessageCircle } from "lucide-react";

interface CTABannerProps {
  headline: string;
  subtext: string;
  buttonLabel: string;
  href: string;
  variant?: "gradient" | "subtle";
  target?: string;
}

export default function CTABanner({
  headline,
  subtext,
  buttonLabel,
  href,
  variant = "gradient",
  target,
}: CTABannerProps) {
  const isGradient = variant === "gradient";

  return (
    <ScrollReveal>
      <div
        className={`relative overflow-hidden rounded-2xl px-6 py-12 md:px-12 md:py-16 text-center ${
          isGradient
            ? "bg-[image:var(--gradient-brand)]"
            : "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
        }`}
      >
        {/* Decorative mesh overlay for gradient variant */}
        {isGradient && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.3)_0%,transparent_70%)]" />
        )}

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto">
          <h3
            className={`text-2xl md:text-3xl font-bold ${
              isGradient ? "text-white" : "text-[var(--text-primary)]"
            }`}
          >
            {headline}
          </h3>

          <p
            className={`text-sm md:text-base max-w-lg ${
              isGradient ? "text-white/80" : "text-[var(--text-secondary)]"
            }`}
          >
            {subtext}
          </p>

          <Link
            href={href}
            target={target}
            rel={target === "_blank" ? "noopener noreferrer" : undefined}
            className={`group inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              isGradient
                ? "bg-white text-[var(--bg-base)] hover:bg-white/90 shadow-lg hover:shadow-xl"
                : "bg-[image:var(--gradient-brand)] text-white hover:opacity-90 shadow-lg"
            }`}
          >
            <MessageCircle size={16} />
            {buttonLabel}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
}
