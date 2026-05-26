import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Education from "@/components/sections/Education";
import BlogPreview from "@/components/sections/BlogPreview";
import CTABanner from "@/components/ui/CTABanner";
import Container from "@/components/ui/Container";
import { getProfile } from "@/lib/api";
import { JsonLd, buildPersonSchema } from "@/lib/schema";

const showBlog = process.env.NEXT_PUBLIC_SHOW_BLOG === "true";

export default async function Home() {
  const [profile, t, tContact] = await Promise.all([
    getProfile(),
    getTranslations("cta"),
    getTranslations("contact"),
  ]);

  return (
    <>
      <JsonLd data={buildPersonSchema(profile)} />
      <Navbar />

      <main className="flex-1 flex flex-col">
        <Hero />
        <About profile={profile} />
        <Projects />

        <Container className="py-8">
          <CTABanner
            headline={t("afterProjects.headline")}
            subtext={t("afterProjects.subtext")}
            buttonLabel={t("afterProjects.button")}
            href="/contact"
            variant="gradient"
          />
        </Container>

        <Skills />
        <Experience />

        <Container className="py-8">
          {profile?.meetingUrl ? (
            <CTABanner
              headline={t("bookCall.headline")}
              subtext={t("bookCall.subtext")}
              buttonLabel={tContact("bookACall")}
              href={profile.meetingUrl}
              target="_blank"
              variant="subtle"
            />
          ) : (
            <CTABanner
              headline={t("afterExperience.headline")}
              subtext={t("afterExperience.subtext")}
              buttonLabel={t("afterExperience.button")}
              href="/contact"
              variant="subtle"
            />
          )}
        </Container>

        <Education />
        {showBlog && <BlogPreview />}
      </main>

      <WhatsAppFAB />
      <Footer />
    </>
  );
}
