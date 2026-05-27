"use client";

import { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import Button from "@/components/ui/Button";
import { deleteExperienceAction } from "@/app/actions/experience";
import { ApiExperience } from "@/lib/api";
import { useTranslations } from "next-intl";

import ExperienceFormModal from "./ExperienceFormModal";

export default function ExperienceClient({
  initialExperiences,
}: {
  initialExperiences: ApiExperience[];
}) {
  const t = useTranslations("adminExperience");
  const [experiences, setExperiences] =
    useState<ApiExperience[]>(initialExperiences);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] =
    useState<ApiExperience | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
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

  const sortedExperiences = experiences;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gap-2">
          <FiPlus /> {t("newExperience")}
        </Button>
      </div>

      <div className="bg-(--bg-surface) border border-(--border-subtle) rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-(--border-subtle) bg-(--bg-elevated)">
              <th className="p-4 text-sm font-medium text-(--text-secondary)">
                {t("table.order")}
              </th>
              <th className="p-4 text-sm font-medium text-(--text-secondary)">
                {t("table.role")}
              </th>
              <th className="p-4 text-sm font-medium text-(--text-secondary)">
                {t("table.company")}
              </th>
              <th className="p-4 text-sm font-medium text-(--text-secondary)">
                {t("table.timeline")}
              </th>
              <th className="p-4 text-sm font-medium text-(--text-secondary) text-right">
                {t("table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border-subtle)">
            {sortedExperiences.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-(--text-muted)">
                  {t("table.empty")}
                </td>
              </tr>
            ) : (
              sortedExperiences.map((e, idx) => (
                <tr
                  key={`exp-${e.id || idx}-${idx}`}
                  className="hover:bg-(--bg-elevated)/50 transition-colors"
                >
                  <td className="p-4 text-sm font-mono text-(--text-muted)">
                    {e.sort_order}
                  </td>
                  <td className="p-4 font-medium text-(--text-primary)">
                    {e.role?.en ?? ""}
                  </td>
                  <td className="p-4 text-(--text-secondary)">{e.company}</td>
                  <td className="p-4 text-sm text-(--text-secondary)">
                    {e.is_current
                      ? `${e.start_date ?? ""} – Present`
                      : `${e.start_date ?? ""} – ${e.end_date ?? ""}`}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(e)}
                        className="p-2 rounded-lg text-(--text-secondary) hover:text-(--accent-violet) hover:bg-(--accent-violet)/10 transition-colors"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="p-2 rounded-lg text-(--text-secondary) hover:text-(--color-error) hover:bg-(--color-error)/10 transition-colors"
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
            const updated = editingExperience
              ? experiences.map((e) => (e.id === savedExp.id ? savedExp : e))
              : [...experiences, savedExp];
            updated.sort((a, b) => {
              if (a.is_current !== b.is_current) return a.is_current ? -1 : 1;
              const aEnd = a.end_date ?? new Date().toISOString().slice(0, 10);
              const bEnd = b.end_date ?? new Date().toISOString().slice(0, 10);
              if (aEnd !== bEnd) return aEnd > bEnd ? -1 : 1;
              return (a.start_date ?? "") > (b.start_date ?? "") ? -1 : 1;
            });
            setExperiences(updated);
          }}
        />
      )}
    </div>
  );
}
