"use client";

import { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiExternalLink } from "react-icons/fi";
import Button from "@/components/ui/Button";
import { deleteEducationAction } from "@/app/actions/education";
import { ApiEducation } from "@/lib/api";
import EducationFormModal from "./EducationFormModal";

export default function EducationClient({
  initialEducation,
}: {
  initialEducation: ApiEducation[];
}) {
  const [education, setEducation] = useState<ApiEducation[]>(initialEducation);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ApiEducation | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    const res = await deleteEducationAction(id);
    if (res.success) {
      setEducation(education.filter((e) => e.id !== id));
    } else {
      alert(res.error || "Failed to delete entry");
    }
  };

  const openEdit = (e: ApiEducation) => {
    setEditingEntry(e);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const sortedEdu = [...education].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gap-2">
          <FiPlus /> Add Entry
        </Button>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <th className="p-4 text-sm font-medium text-[var(--text-secondary)]">
                Type
              </th>
              <th className="p-4 text-sm font-medium text-[var(--text-secondary)]">
                Degree / Certification
              </th>
              <th className="p-4 text-sm font-medium text-[var(--text-secondary)]">
                Institution
              </th>
              <th className="p-4 text-sm font-medium text-[var(--text-secondary)] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {sortedEdu.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-12 text-center text-[var(--text-muted)]"
                >
                  No education or certifications found.
                </td>
              </tr>
            ) : (
              sortedEdu.map((e, idx) => (
                <tr
                  key={`edu-${e.id || idx}-${idx}`}
                  className="hover:bg-[var(--bg-elevated)]/50 transition-colors"
                >
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        e.type === "degree"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-emerald-500/10 text-emerald-500"
                      }`}
                    >
                      {e.type}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-[var(--text-primary)]">
                    <div className="flex items-center gap-2">
                      {e.degree?.en ?? ""}
                      {e.url && (
                        <a
                          href={e.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--text-muted)] hover:text-[var(--accent-violet)]"
                        >
                          <FiExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">
                    {e.institution}
                    <div className="text-xs text-[var(--text-muted)]">
                      {e.is_current ? `${e.start_date ?? ""} – Present` : `${e.start_date ?? ""}`}
                    </div>
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
        <EducationFormModal
          entry={editingEntry}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(saved) => {
            setIsModalOpen(false);
            if (editingEntry) {
              setEducation(
                education.map((e) => (e.id === saved.id ? saved : e)),
              );
            } else {
              setEducation([...education, saved]);
            }
          }}
        />
      )}
    </div>
  );
}
