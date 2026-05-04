"use client";

import { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import Button from "@/components/ui/Button";
import { deleteExperienceAction } from "@/app/actions/experience";
import { ApiExperience } from "@/lib/api";

import ExperienceFormModal from "./ExperienceFormModal";

export default function ExperienceClient({
  initialExperiences,
}: {
  initialExperiences: ApiExperience[];
}) {
  const [experiences, setExperiences] =
    useState<ApiExperience[]>(initialExperiences);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] =
    useState<ApiExperience | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;
    const res = await deleteExperienceAction(id);
    if (res.success) {
      setExperiences(experiences.filter((e) => e.id !== id));
    } else {
      alert(res.error || "Failed to delete experience");
    }
  };

  const openEdit = (e: ApiExperience) => {
    setEditingExperience(e);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingExperience(null);
    setIsModalOpen(true);
  };

  // Sort by sort_order or created date if needed, but here we just show what backend gives
  const sortedExperiences = [...experiences].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gap-2">
          <FiPlus /> New Experience
        </Button>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <th className="p-4 text-sm font-medium text-[var(--text-secondary)]">
                Order
              </th>
              <th className="p-4 text-sm font-medium text-[var(--text-secondary)]">
                Role
              </th>
              <th className="p-4 text-sm font-medium text-[var(--text-secondary)]">
                Company
              </th>
              <th className="p-4 text-sm font-medium text-[var(--text-secondary)]">
                Timeline
              </th>
              <th className="p-4 text-sm font-medium text-[var(--text-secondary)] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {sortedExperiences.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-[var(--text-muted)]"
                >
                  No experience entries found. Add your first job!
                </td>
              </tr>
            ) : (
              sortedExperiences.map((e, idx) => (
                <tr
                  key={`exp-${e.id || idx}-${idx}`}
                  className="hover:bg-[var(--bg-elevated)]/50 transition-colors"
                >
                  <td className="p-4 text-sm font-mono text-[var(--text-muted)]">
                    {e.sort_order}
                  </td>
                  <td className="p-4 font-medium text-[var(--text-primary)]">
                    {e.role}
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">
                    {e.company}
                  </td>
                  <td className="p-4 text-sm text-[var(--text-secondary)]">
                    {e.date_range}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(e)}
                        className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-violet)] hover:bg-[var(--accent-violet)]/10 transition-colors"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
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
        <ExperienceFormModal
          experience={editingExperience}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(savedExp) => {
            setIsModalOpen(false);
            if (editingExperience) {
              setExperiences(
                experiences.map((e) => (e.id === savedExp.id ? savedExp : e)),
              );
            } else {
              setExperiences([...experiences, savedExp]);
            }
          }}
        />
      )}
    </div>
  );
}
