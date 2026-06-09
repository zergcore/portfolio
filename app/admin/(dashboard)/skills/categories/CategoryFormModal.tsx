"use client";

import { useState } from "react";
import {
  createSkillCategoryAction,
  updateSkillCategoryAction,
} from "@/app/actions/skillCategories";
import Button from "@/components/ui/Button";
import { FiX } from "react-icons/fi";
import { ApiSkillCategory } from "@/lib/api";

interface CategoryFormModalProps {
  category: ApiSkillCategory | null;
  onClose: () => void;
  onSuccess: (c: ApiSkillCategory) => void;
}

export default function CategoryFormModal({
  category,
  onClose,
  onSuccess,
}: CategoryFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      name: {
        en: fd.get("name_en") as string,
        es: (fd.get("name_es") as string) || "",
      },
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
      const c = res.data;

      const getEnTextLocal = (field: unknown) => {
        if (!field) return "";
        if (typeof field === "string") return field;
        const localized = field as { en?: string };
        return localized.en || "";
      };

      onSuccess({
        ...c,
        name: getEnTextLocal(c.name),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-(--bg-surface) border border-(--border-subtle) rounded-2xl w-full max-w-md shadow-2xl relative">
        <div className="p-6 border-b border-(--border-subtle) flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">
            {category ? "Edit Category" : "New Category"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-(--text-secondary) hover:text-foreground transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-(--destructive)/10 text-(--destructive) text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-(--text-secondary)">
              Category Name (English) *
            </label>
            <input
              name="name_en"
              defaultValue={
                typeof category?.name === "string"
                  ? category.name
                  : (category?.name as { en?: string })?.en || ""
              }
              required
              className="w-full bg-(--bg-elevated) border border-(--border-default) rounded-xl px-4 py-2 text-foreground focus:ring-2 focus:ring-(--accent-violet) outline-none"
              placeholder="e.g. Frontend, Tools"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-(--text-secondary)">
              Category Name (Spanish)
            </label>
            <input
              name="name_es"
              defaultValue={(category?.name as { es?: string })?.es || ""}
              className="w-full bg-(--bg-elevated) border border-(--border-default) rounded-xl px-4 py-2 text-foreground focus:ring-2 focus:ring-(--accent-violet) outline-none"
              placeholder="e.g. Herramientas"
            />
            <p className="text-xs text-(--text-secondary)">
              Used for localized generation.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-(--text-secondary)">
              Sort Order
            </label>
            <input
              name="sort_order"
              type="number"
              defaultValue={category?.sort_order || 0}
              className="w-full bg-(--bg-elevated) border border-(--border-default) rounded-xl px-4 py-2 text-foreground focus:ring-2 focus:ring-(--accent-violet) outline-none"
            />
          </div>

          <div className="pt-6 border-t border-(--border-subtle) flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              className="bg-(--bg-elevated) hover:bg-[(--border-subtle)] text-foreground"
            >
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
