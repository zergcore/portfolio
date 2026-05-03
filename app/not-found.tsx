import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "404 — Page Not Found | Zergcore.dev",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Gradient background mesh */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-cyan)] opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-violet)] opacity-10 rounded-full blur-3xl" />
      </div>

      {/* 404 number */}
      <h1 className="text-[8rem] md:text-[12rem] font-black leading-none text-transparent bg-clip-text bg-[image:var(--gradient-brand)] select-none">
        404
      </h1>

      <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4 -mt-4">
        Page Not Found
      </h2>

      <p className="text-[var(--text-secondary)] max-w-md mb-10">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
      </p>

      <Link
        href="/"
        className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[image:var(--gradient-brand)] text-white font-semibold text-sm transition-all duration-300 hover:opacity-90 shadow-lg"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
    </div>
  );
}
