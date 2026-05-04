import GradientText from "@/components/typography/GradientText";
import CyclingTypingEffect from "@/components/typography/CyclingTypingEffect";
import MediaButtons from "@/components/buttons/MediaButtons";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Container from "@/components/ui/Container";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center pt-20 pb-16 overflow-hidden">
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-[var(--accent-cyan)]/10 rounded-full blur-[100px] animate-[pulse-ring_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-[var(--accent-violet)]/10 rounded-full blur-[120px] animate-[pulse-ring_10s_ease-in-out_infinite_reverse]" />
      </div>

      <Container className="relative z-10 flex flex-col items-center text-center gap-8">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/50 backdrop-blur-sm text-sm font-medium text-[var(--text-secondary)] mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Available for new opportunities
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="flex flex-col items-center gap-4">
          <GradientText>Zaidibeth Ramos</GradientText>
          <div className="h-10 sm:h-12 flex items-center justify-center">
            <CyclingTypingEffect />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="max-w-2xl">
          <p className="text-lg md:text-xl text-[var(--text-secondary)]">
            Fullstack Engineer bridging the gap between scalable backends and intuitive, high-performance interfaces. Specializing in TypeScript, React, and Python.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3} className="flex flex-wrap items-center justify-center gap-4 mt-4">
          <Button href="/#projects" size="lg">
            View My Work
          </Button>
          <Button href="/resume.pdf" variant="outline" size="lg" download="Zaidibeth_Ramos_Resume.pdf">
            Download Resume
          </Button>
        </ScrollReveal>

        <ScrollReveal delay={0.4} className="mt-8">
          <MediaButtons />
        </ScrollReveal>
      </Container>
    </section>
  );
}
