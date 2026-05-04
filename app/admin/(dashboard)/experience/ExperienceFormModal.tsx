"use client";

import { useState } from "react";
import { createExperienceAction, updateExperienceAction } from "@/app/actions/experience";
import Button from "@/components/ui/Button";
import { FiX } from "react-icons/fi";
import { ApiExperience } from "@/lib/api";

interface ExperienceFormModalProps {
  experience: ApiExperience | null;
  onClose: () => void;
  onSuccess: (e: ApiExperience) => void;
}

export default function ExperienceFormModal({ experience, onClose, onSuccess }: ExperienceFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data = {
      role: fd.get("role") as string,
      company: fd.get("company") as string,
      date_range: fd.get("date_range") as string,
      description: (fd.get("description") as string).split("\n").filter(Boolean),
      tech_stack: (fd.get("tech_stack") as string).split(",").map(s => s.trim()).filter(Boolean),
      sort_order: parseInt(fd.get("sort_order") as string) || 0,
    };

    let res;
    if (experience) {
      res = await updateExperienceAction(experience.id, data);
    } else {
      res = await createExperienceAction(data);
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
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <div className="sticky top-0 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] p-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {experience ? "Edit Experience" : "New Experience"}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Role *</label>
              <input name="role" defaultValue={experience?.role} required className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Company *</label>
              <input name="company" defaultValue={experience?.company} required className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Timeline (e.g. 2022 - Present) *</label>
            <input name="date_range" defaultValue={experience?.date_range} required className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Description (one bullet point per line) *</label>
            <textarea name="description" defaultValue={experience?.description?.join("\n")} required rows={5} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Tech Stack (comma separated)</label>
            <input name="tech_stack" defaultValue={experience?.tech_stack?.join(", ")} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Sort Order</label>
            <input name="sort_order" type="number" defaultValue={experience?.sort_order || 0} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none" />
          </div>

          <div className="pt-6 border-t border-[var(--border-subtle)] flex justify-end gap-3">
            <Button type="button" onClick={onClose} className="bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)]">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Experience"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
