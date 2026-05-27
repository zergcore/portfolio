"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { deleteSkillAction } from "@/app/actions/skills";
import { ApiSkill, ApiSkillCategory } from "@/lib/api";
import SkillFormModal from "./SkillFormModal";

export default function SkillsClient({
  initialSkills,
  categories,
}: {
  initialSkills: ApiSkill[];
  categories: ApiSkillCategory[];
}) {
  const router = useRouter();
  const t = useTranslations("adminSkills");
  const [skills, setSkills] = useState<ApiSkill[]>(initialSkills);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<ApiSkill | null>(null);

  useEffect(() => {
    setSkills(initialSkills);
  }, [initialSkills]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    const res = await deleteSkillAction(id);
    if (res.success) {
      setSkills(skills.filter((s) => s.id !== id));
      router.refresh();
    } else {
      alert(res.error || t("deleteError"));
    }
  };

  const openEdit = (s: ApiSkill) => {
    setEditingSkill(s);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingSkill(null);
    setIsModalOpen(true);
  };

  // Group by category name for grouping logic
  const categoryNames = Array.from(new Set(skills.map((s) => s.category)));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/admin/skills/categories"
          className="text-sm text-(--accent-violet) hover:underline flex items-center gap-1"
        >
          {t("manageCategories")}
        </Link>
        <Button onClick={openNew} className="gap-2">
          <FiPlus /> {t("newSkill")}
        </Button>
      </div>

      {categoryNames.length === 0 ? (
        <div className="p-12 text-center bg-(--bg-surface) border border-(--border-subtle) rounded-xl text-(--text-muted)">
          {t("table.empty")}
        </div>
      ) : (
        categoryNames.map((cat, catIdx) => (
          <div key={`cat-${cat || "misc"}-${catIdx}`} className="space-y-4">
            <h2 className="text-xl font-bold text-(--text-primary) border-l-4 border-(--accent-violet) pl-3">
              {cat || t("other")}
            </h2>
            <div className="bg-(--bg-surface) border border-(--border-subtle) rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-(--border-subtle) bg-(--bg-elevated)">
                    <th className="p-4 text-sm font-medium text-(--text-secondary)">
                      {t("table.name")}
                    </th>
                    <th className="p-4 text-sm font-medium text-(--text-secondary)">
                      {t("table.years")}
                    </th>
                    <th className="p-4 text-sm font-medium text-(--text-secondary)">
                      {t("table.tags")}
                    </th>
                    <th className="p-4 text-sm font-medium text-(--text-secondary) text-right">
                      {t("table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-subtle)">
                  {skills
                    .filter((s) => s.category === cat)
                    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                    .map((s, sIdx) => (
                      <tr
                        key={`skill-${s.id || sIdx}-${sIdx}`}
                        className="hover:bg-(--bg-elevated)/50 transition-colors"
                      >
                        <td className="p-4 font-medium text-(--text-primary)">
                          {s.name.en || s.name.es || ""}
                        </td>
                        <td className="p-4 text-(--text-secondary)">
                          {s.years}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {s.tags?.map((tag, tIdx) => (
                              <span
                                key={`skill-${s.id || sIdx}-tag-${tIdx}`}
                                className="px-2 py-0.5 text-[10px] rounded bg-(--bg-elevated) border border-(--border-default) text-(--text-muted)"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEdit(s)}
                              className="p-2 rounded-lg text-(--text-secondary) hover:text-(--accent-violet) hover:bg-(--accent-violet)/10 transition-colors"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="p-2 rounded-lg text-(--text-secondary) hover:text-(--color-error) hover:bg-(--color-error)/10 transition-colors"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {isModalOpen && (
        <SkillFormModal
          skill={editingSkill}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(savedSkill) => {
            setIsModalOpen(false);
            if (editingSkill) {
              setSkills(
                skills.map((s) => (s.id === savedSkill.id ? savedSkill : s)),
              );
            } else {
              setSkills([...skills, savedSkill]);
            }
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
