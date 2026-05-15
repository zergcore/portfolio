"use client";

import { useState } from "react";
import { Project } from "@/lib/mockData";
import { ApiSkill } from "@/lib/api";
import {
  createProjectAction,
  updateProjectAction,
} from "@/app/actions/projects";
import Button from "@/components/ui/Button";
import MultiImageUpload, { ProjectImage } from "@/components/admin/MultiImageUpload";
import SkillMultiSelect from "@/components/admin/forms/SkillMultiSelect";
import { FiX } from "react-icons/fi";

interface ProjectFormModalProps {
  project: Project | null;
  allSkills: ApiSkill[];
  onClose: () => void;
  onSuccess: (p: Project) => void;
}

export default function ProjectFormModal({
  project,
  allSkills,
  onClose,
  onSuccess,
}: ProjectFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ProjectImage[]>(project?.images || []);
  const [skillIds, setSkillIds] = useState<string[]>(project?.skillIds ?? []);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const titleEn = fd.get("title") as string;
    const descriptionEn = fd.get("description") as string;

    const data = {
      title: { en: titleEn, es: "" },
      slug: fd.get("slug") as string,
      description: { en: descriptionEn, es: "" },
      images,
      image_url: images.find(img => img.is_primary)?.url || null,
      tags: (fd.get("tags") as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      github_url: (fd.get("github_url") as string) || null,
      live_url: (fd.get("live_url") as string) || null,
      is_featured: fd.get("is_featured") === "on",
      sort_order: parseInt(fd.get("sort_order") as string) || 0,
      skill_ids: skillIds,
      role: null,
      timeline: null,
      problem: null,
      approach: null,
      outcomes: null,
      gallery: null,
      primary_category_id: null,
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
      const primaryImage =
        p.images?.find((img: { is_primary: boolean; url: string }) => img.is_primary)?.url ||
        p.image_url ||
        "/placeholder-project.jpg";
      onSuccess({
        id: p.id,
        slug: p.slug,
        title: p.title?.en ?? p.title ?? "",
        description: p.description?.en ?? p.description ?? "",
        imageUrl: primaryImage,
        images: p.images || [],
        tags: p.tags || [],
        githubUrl: p.github_url,
        liveUrl: p.live_url,
        role: p.role?.en ?? p.role ?? undefined,
        timeline: p.timeline,
        problem: p.problem?.en ?? p.problem ?? undefined,
        approach: (p.approach as Array<{heading: {en:string}|string; body: {en:string}|string}>|null)
          ?.map(s => ({
            heading: typeof s.heading === "string" ? s.heading : s.heading.en ?? "",
            body: typeof s.body === "string" ? s.body : s.body.en ?? "",
          })) || [],
        outcomes: p.outcomes?.en ?? p.outcomes ?? [],
        gallery: p.gallery || [],
        is_featured: p.is_featured,
        sort_order: p.sort_order,
        skillIds: p.skills?.map((s: { id: string }) => s.id) ?? skillIds,
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
                Title (EN) *
              </label>
              <input
                name="title"
                defaultValue={
                  typeof project?.title === "string"
                    ? project.title
                    : (project?.title as unknown as { en: string })?.en ?? ""
                }
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
              Description (EN) *
            </label>
            <textarea
              name="description"
              defaultValue={
                typeof project?.description === "string"
                  ? project.description
                  : (project?.description as unknown as { en: string })?.en ?? ""
              }
              required
              rows={3}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
            />
          </div>

          <div className="space-y-2">
            <MultiImageUpload
              label="Project Images (Max 5)"
              images={images}
              onChange={setImages}
            />
          </div>

          <SkillMultiSelect
            allSkills={allSkills}
            selectedIds={skillIds}
            onChange={setSkillIds}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Tags (comma separated, legacy)
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
