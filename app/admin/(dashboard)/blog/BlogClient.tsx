"use client";

import { useState } from "react";
import { BlogPost } from "@/lib/mockData";
import { LocalizedText, ApiBlogPost } from "@/lib/api";
import { FiPlus, FiEdit2, FiTrash2, FiExternalLink, FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslations } from "next-intl";
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

  const t = useTranslations("adminBlog");
  const [posts, setPosts] = useState<BlogPost[]>(mappedPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    const res = await deleteBlogPostAction(id);
    if (res.success) {
      setPosts(posts.filter(p => p.id !== id));
    } else {
      alert(res.error || t("deleteError"));
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


  const headers = [
    t("table.status"),
    t("table.title"),
    t("table.slug"),
    t("table.date"),
    t("table.actions")
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gap-2">
          <FiPlus /> {t("newPost")}
        </Button>
      </div>

      <div className="bg-(--bg-surface) border border-(--border-subtle) rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-(--border-subtle) bg-(--bg-elevated)">
              {headers.map((header, idx) => (
                <th key={`${header}-${idx}`} className={`p-4 text-sm font-medium text-(--text-secondary) ${idx === headers.length - 1 ? 'text-right' : ''}`}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border-subtle)">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-(--text-muted)">
                  {t("table.empty")}
                </td>
              </tr>
            ) : posts.map((p, idx) => (
              <tr key={`blog-${p.id || idx}-${idx}`} className="hover:bg-(--bg-elevated)/50 transition-colors">
                <td className="p-4">
                  {p.isPublished ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                      <FiEye className="w-3 h-3" /> {t("status.published")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                      <FiEyeOff className="w-3 h-3" /> {t("status.draft")}
                    </span>
                  )}
                </td>
                <td className="p-4 font-medium text-(--text-primary)">{p.title}</td>
                <td className="p-4 text-sm text-(--text-secondary) font-mono">{p.slug}</td>
                <td className="p-4 text-sm text-(--text-secondary)">
                  {p.date}
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg text-(--text-secondary) hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors">
                      <FiExternalLink />
                    </a>
                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-(--text-secondary) hover:text-(--accent-violet) hover:bg-(--accent-violet)/10 transition-colors">
                      <FiEdit2 />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg text-(--text-secondary) hover:text-(--color-error) hover:bg-(--color-error)/10 transition-colors">
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
