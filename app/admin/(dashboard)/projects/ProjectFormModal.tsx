"use client";

import { useState } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiX } from "react-icons/fi";
import { Project } from "@/lib/mockData";
import { ApiSkill } from "@/lib/api";
import { createProjectAction, updateProjectAction } from "@/app/actions/projects";
import Button from "@/components/ui/Button";
import MultiImageUpload, { ProjectImage } from "@/components/admin/MultiImageUpload";
import SkillMultiSelect from "@/components/admin/forms/SkillMultiSelect";
import LocalizedTextField from "@/components/admin/forms/LocalizedTextField";
import AISuggestButton from "@/components/admin/AISuggestButton";
import { ProjectCreate } from "@/lib/schemas/project";

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
  const [images, setImages] = useState<ProjectImage[]>(project?.images || []);
  const [skillIds, setSkillIds] = useState<string[]>(project?.skillIds ?? []);
  const [tags, setTags] = useState(project?.tags?.join(", ") ?? "");
  const [error, setError] = useState("");

  const getLocalized = (field: unknown, locale = "en"): string => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return (field as Record<string, string>)[locale] ?? "";
  };

  const methods = useForm<ProjectCreate>({
    resolver: zodResolver(ProjectCreate) as Resolver<ProjectCreate>,
    defaultValues: {
      title: {
        en: getLocalized(project?.title),
        es: getLocalized(project?.title, "es"),
      },
      slug: project?.slug ?? "",
      description: {
        en: getLocalized(project?.description),
        es: getLocalized(project?.description, "es"),
      },
      github_url: project?.githubUrl ?? "",
      live_url: project?.liveUrl ?? "",
      is_featured: project?.is_featured ?? false,
      sort_order: project?.sort_order ?? 0,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  const descriptionEn: string = watch("description.en") ?? "";
  const descriptionSource = typeof descriptionEn === "string" ? descriptionEn : "";

  const onSubmit = async (data: ProjectCreate) => {
    setError("");
    const payload = {
      ...data,
      github_url: data.github_url || null,
      live_url: data.live_url || null,
      tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
      images,
      image_url: images.find((img) => img.is_primary)?.url || null,
      skill_ids: skillIds,
      role: null,
      timeline: null,
      problem: null,
      approach: null,
      outcomes: null,
      gallery: null,
      primary_category_id: null,
    };

    const res = project
      ? await updateProjectAction(project.id, payload)
      : await createProjectAction(payload);

    if (res.error) {
      setError(res.error);
      return;
    }

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
      approach: (p.approach as Array<{ heading: { en: string } | string; body: { en: string } | string }> | null)
        ?.map((s) => ({
          heading: typeof s.heading === "string" ? s.heading : s.heading.en ?? "",
          body: typeof s.body === "string" ? s.body : s.body.en ?? "",
        })) || [],
      outcomes: p.outcomes?.en ?? p.outcomes ?? [],
      gallery: p.gallery || [],
      is_featured: p.is_featured,
      sort_order: p.sort_order,
      skillIds: p.skills?.map((s: { id: string }) => s.id) ?? skillIds,
    });
  };

  const inputClass =
    "w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <div className="sticky top-0 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] p-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {project ? "Edit Project" : "New Project"}
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

            <LocalizedTextField name="title" label="Title" required fieldKind="title" />

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Slug *</label>
              <input {...register("slug")} className={inputClass} />
              {errors.slug && <p className="text-xs text-[var(--color-error)]">{errors.slug.message}</p>}
            </div>

            <LocalizedTextField
              name="description"
              label="Description"
              multiline
              rows={4}
              fieldKind="paragraph"
            />

            <MultiImageUpload label="Project Images (Max 5)" images={images} onChange={setImages} />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Skills</label>
                <AISuggestButton
                  sourceText={descriptionSource}
                  label="Suggest from description"
                  mode="suggest_skills"
                  availableSkills={allSkills.map((s) => s.name.en || s.name.es || "")}
                  onAccept={(text) => {
                    const names = text.split(",").map((s) => s.trim()).filter(Boolean);
                    const matched = allSkills
                      .filter((s) => names.some((n) => n.toLowerCase() === (s.name.en || s.name.es || "").toLowerCase()))
                      .map((s) => s.id);
                    setSkillIds((prev) => Array.from(new Set([...prev, ...matched])));
                  }}
                />
              </div>
              <SkillMultiSelect allSkills={allSkills} selectedIds={skillIds} onChange={setSkillIds} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Tags (comma separated)</label>
                <AISuggestButton
                  sourceText={descriptionSource}
                  label="Suggest from description"
                  mode="suggest_tags"
                  onAccept={(text) => setTags(text)}
                />
              </div>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={inputClass}
                placeholder="react, typescript, fastapi"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">GitHub URL</label>
                <input {...register("github_url")} className={inputClass} />
                {errors.github_url && <p className="text-xs text-[var(--color-error)]">{errors.github_url.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Live URL</label>
                <input {...register("live_url")} className={inputClass} />
                {errors.live_url && <p className="text-xs text-[var(--color-error)]">{errors.live_url.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  {...register("is_featured")}
                  className="w-4 h-4 rounded text-[var(--accent-violet)] bg-[var(--bg-elevated)] border-[var(--border-default)] focus:ring-[var(--accent-violet)]"
                />
                Featured Project
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Sort Order:</label>
                <input
                  type="number"
                  {...register("sort_order", { valueAsNumber: true })}
                  className="w-20 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-1 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-subtle)] flex justify-end gap-3">
              <Button type="button" onClick={onClose} className="bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)]">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Project"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
