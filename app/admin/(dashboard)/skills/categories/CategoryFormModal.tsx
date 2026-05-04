"use client";

import { useState } from "react";
import { createSkillCategoryAction, updateSkillCategoryAction } from "@/app/actions/skillCategories";
import Button from "@/components/ui/Button";
import { FiX } from "react-icons/fi";
import { ApiSkillCategory, SkillCategoryCreate } from "@/lib/api";

interface CategoryFormModalProps {
  category: ApiSkillCategory | null;
  onClose: () => void;
  onSuccess: (c: ApiSkillCategory) => void;
}

export default function CategoryFormModal({ category, onClose, onSuccess }: CategoryFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data: SkillCategoryCreate = {
      name: fd.get("name") as string,
      sort_order: parseInt(fd.get("sort_order") as string) || 0,
    };

    let res;
    if (category) {
      res = await updateSkillCategoryAction(category.id, data);
    } else {
      res = await createSkillCategoryAction(data);
    }

    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      onSuccess(res.data);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-md shadow-2xl relative">
        <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {category ? "Edit Category" : "New Category"}
          </h2>
          <button onClick={onClose} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
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
            <label className="text-sm font-medium text-[var(--text-secondary)]">Category Name *</label>
            <input name="name" defaultValue={category?.name} required className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none" placeholder="e.g. Frontend, Tools" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Sort Order</label>
            <input name="sort_order" type="number" defaultValue={category?.sort_order || 0} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none" />
          </div>

          <div className="pt-6 border-t border-[var(--border-subtle)] flex justify-end gap-3">
            <Button type="button" onClick={onClose} className="bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)]">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
