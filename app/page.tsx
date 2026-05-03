"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";

export default function Home() {
  return (
    <>
      <Navbar />
      
      <main className="flex-1 flex flex-col">
        <Hero />
        <Projects />
        <Skills />
      </main>

      <WhatsAppFAB />
      <Footer />
    </>
  );
}
