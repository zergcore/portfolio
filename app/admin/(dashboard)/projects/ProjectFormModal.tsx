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
  const [skillIds, setSkillIds] = useState<string[]>(project?.skillIds || []);
  const [skillSelect, setSkillSelect] = useState("");
  const [error, setError] = useState("");

  const skillsByCategory = allSkills.reduce<Record<string, ApiSkill[]>>((acc, s) => {
    const cat = s.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data = {
      title: { en: fd.get("title") as string, es: "" },
      slug: fd.get("slug") as string,
      description: { en: fd.get("description") as string, es: "" },
      images: images,
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
      const primaryImage = p.images?.find((img: { is_primary: boolean; url: string }) => img.is_primary)?.url || p.image_url || "/placeholder-project.jpg";
      const enText = (f: unknown) => (f && typeof f === "object" ? (f as { en?: string }).en ?? "" : (f as string) ?? "");
      onSuccess({
        id: p.id,
        slug: p.slug,
        title: enText(p.title),
        description: enText(p.description),
        imageUrl: primaryImage,
        images: p.images || [],
        tags: p.tags || [],
        githubUrl: p.github_url,
        liveUrl: p.live_url,
        is_featured: p.is_featured,
        sort_order: p.sort_order,
        skillIds: p.skills?.map((s: { id: string }) => s.id) || [],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <div className="sticky top-0 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] p-6 flex justify-between items-center z-20">
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
            <MultiImageUpload
              label="Project Images (Max 5)"
              images={images}
              onChange={setImages}
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

          {allSkills.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Skills
              </label>
              <select
                value={skillSelect}
                onChange={e => {
                  const id = e.target.value;
                  if (id) {
                    setSkillIds(prev => [...prev, id]);
                    setSkillSelect("");
                  }
                }}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              >
                <option value="">Add a skill…</option>
                {Object.entries(skillsByCategory).map(([cat, skills]) => (
                  <optgroup key={cat} label={cat}>
                    {skills.filter(s => !skillIds.includes(s.id)).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {skillIds.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {allSkills.filter(s => skillIds.includes(s.id)).map(skill => (
                    <span
                      key={skill.id}
                      className="group relative inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent-violet)]/15 border border-[var(--accent-violet)]/40 text-[var(--accent-violet)] cursor-pointer select-none"
                      onClick={() => setSkillIds(prev => prev.filter(id => id !== skill.id))}
                    >
                      {skill.name}
                      <span className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FiX size={11} />
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

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
