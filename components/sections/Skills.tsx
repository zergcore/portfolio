import { getTranslations } from "next-intl/server";
import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SkillCategoryCard from "@/components/cards/SkillCategoryCard";
import { getSkills } from "@/lib/api";

export default async function Skills() {
  const [skills, t] = await Promise.all([getSkills(), getTranslations("skills")]);

  return (
    <Section id="skills" className="bg-[var(--bg-elevated)]/30 border-y border-[var(--border-subtle)]">
      <ScrollReveal>
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            {t("sectionLabel")}{" "}
            <span className="text-transparent bg-clip-text bg-[image:var(--gradient-brand)]">
              {t("sectionHighlight")}
            </span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            {t("sectionDescription")}
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {skills.map((category, idx) => (
          <ScrollReveal key={`skill-cat-${idx}`} delay={0.1 * (idx + 1)}>
            <SkillCategoryCard
              title={category.title}
              skills={category.skills}
              yearsLabel={t("years")}
            />
          </ScrollReveal>
        ))}
      </div>
    </Section>
  );
}
