"use client";

import { useState } from "react";
import { Project } from "@/lib/mockData";
import {
  createProjectAction,
  updateProjectAction,
} from "@/app/actions/projects";
import Button from "@/components/ui/Button";
import ImageUpload from "@/components/admin/ImageUpload";
import { FiX } from "react-icons/fi";

interface ProjectFormModalProps {
  project: Project | null;
  onClose: () => void;
  onSuccess: (p: Project) => void;
}

export default function ProjectFormModal({
  project,
  onClose,
  onSuccess,
}: ProjectFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState(project?.imageUrl || "");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data = {
      title: fd.get("title") as string,
      slug: fd.get("slug") as string,
      description: fd.get("description") as string,
      image_url: imageUrl || null,
      tags: (fd.get("tags") as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      github_url: (fd.get("github_url") as string) || null,
      live_url: (fd.get("live_url") as string) || null,
      is_featured: fd.get("is_featured") === "on",
      sort_order: parseInt(fd.get("sort_order") as string) || 0,
      // Default nulls for case study fields until form is expanded
      role: null,
      timeline: null,
      problem: null,
      approach: null,
      outcomes: null,
      gallery: null,
    };

    let res;
    if (project) {
      res = await updateProjectAction(project.id, data);
    } else {
      res = await createProjectAction(data);
    }

    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      const p = res.data;
      onSuccess({
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        imageUrl: p.image_url,
        tags: p.tags || [],
        githubUrl: p.github_url,
        liveUrl: p.live_url,
        role: p.role,
        timeline: p.timeline,
        problem: p.problem,
        approach: p.approach || [],
        outcomes: p.outcomes || [],
        gallery: p.gallery || [],
        is_featured: p.is_featured,
        sort_order: p.sort_order,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <div className="sticky top-0 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] p-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {project ? "Edit Project" : "New Project"}
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
                defaultValue={project?.title}
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
                defaultValue={project?.slug}
                required
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Description *
            </label>
            <textarea
              name="description"
              defaultValue={project?.description}
              required
              rows={3}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
            />
          </div>

          <div className="space-y-2">
            <ImageUpload
              label="Project Thumbnail"
              value={imageUrl}
              onChange={setImageUrl}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Tags (comma separated)
            </label>
            <input
              name="tags"
              defaultValue={project?.tags?.join(", ")}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                GitHub URL
              </label>
              <input
                name="github_url"
                defaultValue={project?.githubUrl}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Live URL
              </label>
              <input
                name="live_url"
                defaultValue={project?.liveUrl}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[var(--text-primary)]">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={project?.is_featured ?? false}
                className="w-4 h-4 rounded text-[var(--accent-violet)] bg-[var(--bg-elevated)] border-[var(--border-default)] focus:ring-[var(--accent-violet)] focus:ring-offset-[var(--bg-surface)]"
              />
              Featured Project
            </label>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Sort Order:
              </label>
              <input
                type="number"
                name="sort_order"
                defaultValue={project?.sort_order ?? 0}
                className="w-20 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-1 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              />
            </div>
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
              {isSubmitting ? "Saving..." : "Save Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
