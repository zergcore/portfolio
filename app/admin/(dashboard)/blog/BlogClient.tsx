"use client";

import { useState } from "react";
import { BlogPost } from "@/lib/mockData";
import { LocalizedText, ApiBlogPost } from "@/lib/api";
import { FiPlus, FiEdit2, FiTrash2, FiExternalLink, FiEye, FiEyeOff } from "react-icons/fi";
import Button from "@/components/ui/Button";
import { deleteBlogPostAction } from "@/app/actions/blog";
import BlogFormModal from "./BlogFormModal";

/** Helper to extract English text from localized fields */
function getEnText(field: LocalizedText | string | undefined | null): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field.en || "";
}

export default function BlogClient({ initialPosts }: { initialPosts: ApiBlogPost[] }) {
  // Map snake_case from getAdminBlogPosts to camelCase BlogPost with i18n handling
  const mappedPosts: BlogPost[] = initialPosts.map(p => ({
    id: p.id,
    slug: p.slug,
    title: getEnText(p.title),
    excerpt: getEnText(p.excerpt),
    content: getEnText(p.content),
    tags: p.tags || [],
    readingTime: p.reading_time || "5 min read",
    isPublished: p.is_published,
    date: p.published_at?.split("T")[0] || p.created_at?.split("T")[0] || "Recent",
  }));

  const [posts, setPosts] = useState<BlogPost[]>(mappedPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const res = await deleteBlogPostAction(id);
    if (res.success) {
      setPosts(posts.filter(p => p.id !== id));
    } else {
      alert(res.error || "Failed to delete post");
    }
  };

  const openEdit = (p: BlogPost) => {
    setEditingPost(p);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };


  const headers = ['Status', 'Title', 'Slug', 'Date', 'Actions'];



  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gap-2">
          <FiPlus /> New Post
        </Button>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              {headers.map((header, idx) => (
                <th key={`${header}-${idx}`} className={`p-4 text-sm font-medium text-[var(--text-secondary)] ${idx === headers.length - 1 ? 'text-right' : ''}`}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">
                  No posts found. Write something!
                </td>
              </tr>
            ) : posts.map((p, idx) => (
              <tr key={`blog-${p.id || idx}-${idx}`} className="hover:bg-[var(--bg-elevated)]/50 transition-colors">
                <td className="p-4">
                  {p.isPublished ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                      <FiEye className="w-3 h-3" /> Published
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                      <FiEyeOff className="w-3 h-3" /> Draft
                    </span>
                  )}
                </td>
                <td className="p-4 font-medium text-[var(--text-primary)]">{p.title}</td>
                <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">{p.slug}</td>
                <td className="p-4 text-sm text-[var(--text-secondary)]">
                  {p.date}
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors">
                      <FiExternalLink />
                    </a>
                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-violet)] hover:bg-[var(--accent-violet)]/10 transition-colors">
                      <FiEdit2 />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors">
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <BlogFormModal
          post={editingPost}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(savedPost) => {
            setIsModalOpen(false);
            if (editingPost) {
              setPosts(posts.map(p => p.id === savedPost.id ? savedPost : p));
            } else {
              setPosts([savedPost, ...posts]);
            }
          }}
        />
      )}
    </div>
  );
}
