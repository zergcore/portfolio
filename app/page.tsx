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
        <Skills />
        <Experience />
        <Education />
        {showBlog && <BlogPreview />}
      </main>

      <WhatsAppFAB />
      <Footer />
    </>
  );
}
