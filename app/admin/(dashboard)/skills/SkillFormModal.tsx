"use client";

import { useState } from "react";
import { createSkillAction, updateSkillAction } from "@/app/actions/skills";
import Button from "@/components/ui/Button";
import { FiX } from "react-icons/fi";
import { ApiSkill, ApiSkillCategory } from "@/lib/api";
import Link from "next/link";

interface SkillFormModalProps {
  skill: ApiSkill | null;
  categories: ApiSkillCategory[];
  onClose: () => void;
  onSuccess: (s: ApiSkill) => void;
}

export default function SkillFormModal({
  skill,
  categories,
  onClose,
  onSuccess,
}: SkillFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const categoryId = fd.get("category_id") as string;
    const categoryObj = categories.find((c) => c.id === categoryId);

    const data: Record<string, unknown> = {
      name: fd.get("name") as string,
      category: typeof categoryObj?.name === "string" ? categoryObj.name : (categoryObj?.name as { en?: string })?.en || "", 
      category_id: categoryId,
      years: parseInt(fd.get("years") as string) || 0,
      tags: (fd.get("tags") as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      sort_order: parseInt(fd.get("sort_order") as string) || 0,
    };

    let res;
    if (skill) {
      res = await updateSkillAction(skill.id, data);
    } else {
      res = await createSkillAction(data);
    }

    setIsSubmitting(false);

    if (res.error) {
      setError(typeof res.error === "string" ? res.error : "Failed to save skill");
    } else if (res.success) {
      onSuccess(res.data);
    }
  };

  const getEnText = (field: unknown) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return (field as { en?: string }).en || "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-lg shadow-2xl relative">
        <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {skill ? "Edit Skill" : "New Skill"}
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Skill Name *
            </label>
            <input
              name="name"
              defaultValue={skill?.name}
              required
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              placeholder="e.g. React, Python, AWS"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Category *
            </label>
            <select
              name="category_id"
              defaultValue={skill?.category_id || ""}
              required
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {getEnText(c.name)}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-[var(--text-muted)]">
              Manage categories in the{" "}
              <Link
                href="/admin/skills/categories"
                className="text-[var(--accent-violet)] hover:underline"
              >
                Category Manager
              </Link>
              .
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Years of Experience
              </label>
              <input
                name="years"
                type="number"
                defaultValue={skill?.years || 0}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Sort Order
              </label>
              <input
                name="sort_order"
                type="number"
                defaultValue={skill?.sort_order || 0}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Tags (comma separated)
            </label>
            <input
              name="tags"
              defaultValue={skill?.tags?.join(", ")}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              placeholder="e.g. hooks, state management"
            />
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
              {isSubmitting ? "Saving..." : "Save Skill"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
