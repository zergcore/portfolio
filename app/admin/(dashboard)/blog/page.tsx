import { getAdminBlogPosts } from "@/lib/adminApi";
import BlogClient from "./BlogClient";

export const revalidate = 0;

export default async function AdminBlogPage() {
  const { items: posts } = await getAdminBlogPosts();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Manage Blog
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Write, edit, and publish your thoughts. AI integration coming soon.
        </p>
      </div>

      <BlogClient initialPosts={posts} />
    </div>
  );
}
