"use client";

import { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import Link from "next/link";
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
  const [skills, setSkills] = useState<ApiSkill[]>(initialSkills);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<ApiSkill | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    const res = await deleteSkillAction(id);
    if (res.success) {
      setSkills(skills.filter((s) => s.id !== id));
    } else {
      alert(res.error || "Failed to delete skill");
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
          className="text-sm text-[var(--accent-violet)] hover:underline flex items-center gap-1"
        >
          Manage Categories
        </Link>
        <Button onClick={openNew} className="gap-2">
          <FiPlus /> New Skill
        </Button>
      </div>

      {categoryNames.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)]">
          No skills found. Add your expertise!
        </div>
      ) : (
        categoryNames.map((cat, catIdx) => (
          <div key={`cat-${cat || "misc"}-${catIdx}`} className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] border-l-4 border-[var(--accent-violet)] pl-3">
              {cat || "Other"}
            </h2>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                    <th className="p-4 text-sm font-medium text-[var(--text-secondary)]">
                      Name
                    </th>
                    <th className="p-4 text-sm font-medium text-[var(--text-secondary)]">
                      Years
                    </th>
                    <th className="p-4 text-sm font-medium text-[var(--text-secondary)]">
                      Tags
                    </th>
                    <th className="p-4 text-sm font-medium text-[var(--text-secondary)] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {skills
                    .filter((s) => s.category === cat)
                    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                    .map((s, sIdx) => (
                      <tr
                        key={`skill-${s.id || sIdx}-${sIdx}`}
                        className="hover:bg-[var(--bg-elevated)]/50 transition-colors"
                      >
                        <td className="p-4 font-medium text-[var(--text-primary)]">
                          {s.name}
                        </td>
                        <td className="p-4 text-[var(--text-secondary)]">
                          {s.years}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {s.tags?.map((t, tIdx) => (
                              <span
                                key={`skill-${s.id || sIdx}-tag-${tIdx}`}
                                className="px-2 py-0.5 text-[10px] rounded bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-muted)]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEdit(s)}
                              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-violet)] hover:bg-[var(--accent-violet)]/10 transition-colors"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
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
          }}
        />
      )}
    </div>
  );
}
