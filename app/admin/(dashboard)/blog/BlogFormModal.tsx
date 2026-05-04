"use client";

import { useState } from "react";
import { createBlogPostAction, updateBlogPostAction } from "@/app/actions/blog";
import { BlogPost } from "@/lib/mockData";
import Button from "@/components/ui/Button";
import { FiX, FiInfo } from "react-icons/fi";

interface BlogFormModalProps {
  post: BlogPost | null;
  onClose: () => void;
  onSuccess: (p: BlogPost) => void;
}

export default function BlogFormModal({
  post,
  onClose,
  onSuccess,
}: BlogFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data = {
      title: fd.get("title") as string,
      slug: fd.get("slug") as string,
      excerpt: fd.get("excerpt") as string,
      content: fd.get("content") as string,
      tags: (fd.get("tags") as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      reading_time: (fd.get("reading_time") as string) || null,
      is_published: fd.get("is_published") === "on",
    };

    let res;
    if (post) {
      res = await updateBlogPostAction(post.id, data);
    } else {
      res = await createBlogPostAction(data);
    }

    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      const b = res.data;
      onSuccess({
        id: b.id,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt,
        content: b.content,
        tags: b.tags || [],
        readingTime: b.reading_time || "5 min read",
        isPublished: b.is_published,
        date:
          b.published_at?.split("T")[0] ||
          b.created_at?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl relative">
        <div className="sticky top-0 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] p-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {post ? "Edit Blog Post" : "New Blog Post"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-[var(--color-error)]/10 text-[var(--color-error)] text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Title *
              </label>
              <input
                name="title"
                defaultValue={post?.title}
                required
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Slug *
              </label>
              <input
                name="slug"
                defaultValue={post?.slug}
                required
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Excerpt
            </label>
            <textarea
              name="excerpt"
              defaultValue={post?.excerpt}
              rows={2}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              placeholder="Brief summary of the post..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Content (Markdown) *
              </label>
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <FiInfo className="w-3 h-3" /> Supports basic markdown
              </span>
            </div>
            <textarea
              name="content"
              defaultValue={post?.content}
              required
              rows={12}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] font-mono text-sm focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              placeholder="# Hello World\n\nThis is a blog post..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Tags (comma separated)
              </label>
              <input
                name="tags"
                defaultValue={post?.tags?.join(", ")}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Reading Time
              </label>
              <input
                name="reading_time"
                defaultValue={post?.readingTime || "5 min read"}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[var(--text-primary)]">
              <input
                type="checkbox"
                name="is_published"
                defaultChecked={post?.isPublished ?? false}
                className="w-4 h-4 rounded text-[var(--accent-violet)] bg-[var(--bg-elevated)] border-[var(--border-default)] focus:ring-[var(--accent-violet)] focus:ring-offset-[var(--bg-surface)]"
              />
              Published (Visible on site)
            </label>
          </div>

          <div className="pt-6 border-t border-[var(--border-subtle)] flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              className="bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)]"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
