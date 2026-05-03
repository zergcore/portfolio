"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Education from "@/components/sections/Education";
import BlogPreview from "@/components/sections/BlogPreview";
import CTABanner from "@/components/ui/CTABanner";
import Container from "@/components/ui/Container";

/**
 * Controls blog visibility on the homepage.
 * Set NEXT_PUBLIC_SHOW_BLOG=true in .env.local to display the blog preview.
 */
const showBlog = process.env.NEXT_PUBLIC_SHOW_BLOG === "true";

export default function Home() {
  return (
    <>
      <Navbar />
      
      <main className="flex-1 flex flex-col">
        <Hero />
        <Projects />

        {/* CTA after Projects */}
        <Container className="py-8">
          <CTABanner
            headline="Like What You See?"
            subtext="I'm open to new opportunities. Let's discuss how I can bring this level of engineering to your team."
            buttonLabel="Let's Talk"
            href="/contact"
            variant="gradient"
          />
        </Container>

        <Skills />
        <Experience />

        {/* CTA after Experience */}
        <Container className="py-8">
          <CTABanner
            headline="Ready to Build Something Great?"
            subtext="Whether it's a greenfield project or scaling an existing platform, I'd love to hear about your challenges."
            buttonLabel="Get in Touch"
            href="/contact"
            variant="subtle"
          />
        </Container>

        <Education />
        {showBlog && <BlogPreview />}
      </main>

      <WhatsAppFAB />
      <Footer />
    </>
  );
}
