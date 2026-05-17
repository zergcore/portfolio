"use client";

import { useState } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiX } from "react-icons/fi";
import { createBlogPostAction, updateBlogPostAction } from "@/app/actions/blog";
import { BlogPost } from "@/lib/mockData";
import Button from "@/components/ui/Button";
import ImageUpload from "@/components/admin/ImageUpload";
import LocalizedTextField from "@/components/admin/forms/LocalizedTextField";
import { BlogCreate } from "@/lib/schemas/blog";

interface BlogFormModalProps {
  post: BlogPost | null;
  onClose: () => void;
  onSuccess: (p: BlogPost) => void;
}

export default function BlogFormModal({ post, onClose, onSuccess }: BlogFormModalProps) {
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || "");
  const [error, setError] = useState("");

  const getLocalized = (field: unknown, locale = "en"): string => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return (field as Record<string, string>)[locale] ?? "";
  };

  const methods = useForm<BlogCreate>({
    resolver: zodResolver(BlogCreate) as Resolver<BlogCreate>,
    defaultValues: {
      title: { en: getLocalized(post?.title), es: "" },
      slug: post?.slug ?? "",
      excerpt: { en: getLocalized(post?.excerpt), es: "" },
      content: { en: getLocalized(post?.content), es: "" },
      tags: post?.tags?.join(", ") ?? "",
      reading_time: post?.readingTime ?? "5 min read",
      is_published: post?.isPublished ?? false,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: BlogCreate) => {
    setError("");
    const payload = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      image_url: imageUrl || null,
      tags: data.tags.split(",").map((s) => s.trim()).filter(Boolean),
      reading_time: data.reading_time || null,
      is_published: data.is_published,
    };

    const res = post ? await updateBlogPostAction(post.id, payload) : await createBlogPostAction(payload);

    if (res.error) {
      setError(res.error);
      return;
    }

    const b = res.data;
    const getEnText = (field: unknown) => {
      if (!field) return "";
      if (typeof field === "string") return field;
      return (field as { en?: string }).en || "";
    };

    onSuccess({
      id: b.id,
      slug: b.slug,
      title: getEnText(b.title),
      excerpt: getEnText(b.excerpt),
      content: getEnText(b.content),
      tags: b.tags || [],
      readingTime: b.reading_time || "5 min read",
      isPublished: b.is_published,
      imageUrl: b.image_url,
      date:
        b.published_at?.split("T")[0] ||
        b.created_at?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
    });
  };

  const inputClass =
    "w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl relative">
        <div className="sticky top-0 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] p-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {post ? "Edit Blog Post" : "New Blog Post"}
          </h2>
          <button onClick={onClose} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-[var(--color-error)]/10 text-[var(--color-error)] text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LocalizedTextField name="title" label="Title" required fieldKind="title" />
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Slug *</label>
                <input {...register("slug")} className={inputClass} />
                {errors.slug && <p className="text-xs text-[var(--color-error)]">{errors.slug.message}</p>}
              </div>
            </div>

            <ImageUpload label="Featured Image" value={imageUrl} onChange={setImageUrl} />

            <LocalizedTextField
              name="excerpt"
              label="Excerpt"
              multiline
              rows={2}
              fieldKind="paragraph"
              placeholder={{ en: "Brief summary of the post…", es: "Breve resumen del artículo…" }}
            />

            <LocalizedTextField
              name="content"
              label="Content (Markdown)"
              multiline
              rows={14}
              fieldKind="paragraph"
              placeholder={{ en: "# Hello World\n\nThis is a blog post…", es: "# Hola Mundo\n\nEste es un artículo…" }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Tags (comma separated)</label>
                <input {...register("tags")} className={inputClass} placeholder="react, typescript, fastapi" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Reading Time</label>
                <input {...register("reading_time")} className={inputClass} placeholder="5 min read" />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[var(--text-primary)]">
              <input
                type="checkbox"
                {...register("is_published")}
                className="w-4 h-4 rounded text-[var(--accent-violet)] bg-[var(--bg-elevated)] border-[var(--border-default)] focus:ring-[var(--accent-violet)]"
              />
              Published (Visible on site)
            </label>

            <div className="pt-6 border-t border-[var(--border-subtle)] flex justify-end gap-3">
              <Button type="button" onClick={onClose} className="bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)]">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Post"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
