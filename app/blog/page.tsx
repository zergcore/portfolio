import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import Section from "@/components/ui/Section";
import { getBlogPosts } from "@/lib/api";
import BlogCard from "@/components/cards/BlogCard";
import { ArrowLeft, PenLine } from "lucide-react";

export const metadata = {
  title: "Blog | Zergcore.dev",
  description:
    "Technical articles on full-stack architecture, performance optimization, and engineering career growth by Zaidibeth Ramos.",
};

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();
  const posts = blogPosts;

  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col">
        <Section id="blog-listing" className="pt-32">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-16">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-(--text-muted) hover:text-(--accent-cyan) transition-colors mb-8"
            >
              <ArrowLeft size={14} />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              The{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-(--accent-cyan) to-(--accent-violet)">
                Blog
              </span>
            </h1>
            <p className="text-(--text-secondary) max-w-2xl">
              Technical deep-dives, architecture decisions, and lessons learned
              from building production software.
            </p>
          </div>

          {/* Articles grid or empty state */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-4 rounded-full bg-(--bg-elevated) border border-(--border-subtle) mb-6">
                <PenLine size={32} className="text-(--text-muted)" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                No articles yet
              </h2>
              <p className="text-(--text-secondary) max-w-md mb-8">
                I&apos;m working on some technical deep-dives. Check back soon
                for articles on architecture, performance, and career growth.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-foreground border border-(--border-strong) rounded-full hover:border-(--accent-cyan) hover:text-(--accent-cyan) transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Home
              </Link>
            </div>
          )}
        </Section>
      </main>

      <WhatsAppFAB />
      <Footer />
    </>
  );
}
