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

/**
 * Controls blog visibility on the homepage.
 * Set NEXT_PUBLIC_SHOW_BLOG=true in .env.local to display the blog preview.
 */

const showBlog = process.env.NEXT_PUBLIC_SHOW_BLOG === "true";
const domain = process.env.NEXT_PUBLIC_SITE_URL;

export default async function Home() {
  const profile = await getProfile();

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile?.name ?? "Zaidibeth Ramos",
    url: `${domain}`,
    jobTitle: profile?.title ?? "Full-Stack Software Engineer",
    description: profile?.bio,
    email: profile?.email,
    image: profile?.imageUrl ?? `${domain}/zr.jpg`,
    sameAs: [profile?.githubUrl, profile?.linkedinUrl].filter(Boolean),
    knowsAbout: [
      "React",
      "Next.js",
      "Node.js",
      "TypeScript",
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Distributed Systems",
      "AI Integration",
      "Cloud Architecture",
      "Machine Learning",
      "Deep Learning",
      "Microservices",
      "API Development",
      "Database Design",
      "Data Science",
      "Big Data",
      "AI",
      "MERN Stack",
      "RESTful APIs",
      "Docker",
      "AWS",
      "CI/CD",
      "Agile Methodology",
      "Test-Driven Development",
      "Software Architecture",
      "System Design",
      "Performance Optimization",
      "Security Best Practices",
      "Web Development",
      "Big Data Analytics",
      "Business Intelligence",
      "Machine Learning Engineering",
      "Deep Learning Engineering",
      "Data Engineering",
      "MLOps",
      "AI Engineering",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar />

      <main className="flex-1 flex flex-col">
        <Hero />
        <About profile={profile} />
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
