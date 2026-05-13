"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { deleteSkillCategoryAction } from "@/app/actions/skillCategories";
import { ApiSkillCategory, LocalizedText } from "@/lib/api";
import CategoryFormModal from "./CategoryFormModal";

/** Helper to extract English text from localized fields */
function getEnText(field: LocalizedText | string | undefined | null): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field.en || "";
}

export default function CategoriesClient({
  initialCategories,
}: {
  initialCategories: ApiSkillCategory[];
}) {
  const router = useRouter();
  const [categories, setCategories] =
    useState<ApiSkillCategory[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ApiSkillCategory | null>(null);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure? Deleting a category might affect skills assigned to it.",
      )
    )
      return;
    const res = await deleteSkillCategoryAction(id);
    if (res.success) {
      setCategories(categories.filter((c) => c.id !== id));
      router.refresh();
    } else {
      alert(res.error || "Failed to delete category");
    }
  };

  const openEdit = (c: ApiSkillCategory) => {
    setEditingCategory(c);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const sortedCategories = [...categories].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link
          href="/admin/skills"
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <FiArrowLeft /> Back to Skills
        </Link>
        <Button onClick={openNew} className="gap-2">
          <FiPlus /> New Category
        </Button>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <th className="p-4 text-sm font-medium text-[var(--text-secondary)] w-20">
                Order
              </th>
              <th className="p-4 text-sm font-medium text-[var(--text-secondary)]">
                Name
              </th>
              <th className="p-4 text-sm font-medium text-[var(--text-secondary)] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {sortedCategories.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="p-8 text-center text-[var(--text-muted)]"
                >
                  No categories found.
                </td>
              </tr>
            ) : (
              sortedCategories.map((c, idx) => (
                <tr
                  key={`cat-${c.id || idx}-${idx}`}
                  className="hover:bg-[var(--bg-elevated)]/50 transition-colors"
                >
                  <td className="p-4 text-sm font-mono text-[var(--text-muted)]">
                    {c.sort_order}
                  </td>
                  <td className="p-4 font-medium text-[var(--text-primary)]">
                    {getEnText(c.name)}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-violet)] hover:bg-[var(--accent-violet)]/10 transition-colors"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(saved) => {
            setIsModalOpen(false);
            if (editingCategory) {
              setCategories(
                categories.map((c) => (c.id === saved.id ? saved : c)),
              );
            } else {
              setCategories([...categories, saved]);
            }
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
