"use client";

import { useState } from "react";
import {
  createEducationAction,
  updateEducationAction,
} from "@/app/actions/education";
import Button from "@/components/ui/Button";
import { FiX } from "react-icons/fi";
import { ApiEducation, EducationCreate } from "@/lib/api";

interface EducationFormModalProps {
  entry: ApiEducation | null;
  onClose: () => void;
  onSuccess: (e: ApiEducation) => void;
}

export default function EducationFormModal({
  entry,
  onClose,
  onSuccess,
}: EducationFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const typeValue = fd.get("type") as string;
    const data: EducationCreate = {
      type: (typeValue === "certification" ? "certification" : "degree") as "degree" | "certification",
      degree: (fd.get("degree") as string) || "",
      institution: (fd.get("institution") as string) || "",
      date_range: (fd.get("date_range") as string) || "",
      description: (fd.get("description") as string) || "",
      image_url: (fd.get("image_url") as string) || null,
      url: (fd.get("url") as string) || null,
      related_project_ids: entry?.related_project_ids || null,
      sort_order: parseInt(fd.get("sort_order") as string) || 0,
    };

    const res = entry
      ? await updateEducationAction(entry.id, data)
      : await createEducationAction(data);

    setIsSubmitting(false);

    if (res.success) {
      onSuccess(res.data);
    } else {
      setError(res.error || "An error occurred");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden">
        <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {entry ? "Edit Education Entry" : "New Education Entry"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 max-h-[80vh] overflow-y-auto"
        >
          {error && (
            <div className="p-3 rounded-lg bg-[var(--color-error)]/10 text-[var(--color-error)] text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Type
              </label>
              <select
                name="type"
                defaultValue={entry?.type || "degree"}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              >
                <option value="degree">Degree / Academic</option>
                <option value="certification">
                  Certification / Professional
                </option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Sort Order
              </label>
              <input
                name="sort_order"
                type="number"
                defaultValue={entry?.sort_order || 0}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Degree / Title *
            </label>
            <input
              name="degree"
              defaultValue={entry?.degree}
              required
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              placeholder="e.g. B.Sc. in Computer Science"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Institution / Issuer *
            </label>
            <input
              name="institution"
              defaultValue={entry?.institution}
              required
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              placeholder="e.g. Stanford University, AWS, Google"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Date Range *
            </label>
            <input
              name="date_range"
              defaultValue={entry?.date_range}
              required
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              placeholder="e.g. 2018 - 2022, Issued May 2023"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={entry?.description}
              rows={3}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none resize-none"
              placeholder="Briefly describe your focus or achievements..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Image URL (Icon/Logo)
              </label>
              <input
                name="image_url"
                defaultValue={entry?.image_url || ""}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
                placeholder="URL to institution logo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                URL (Verification Link)
              </label>
              <input
                name="url"
                defaultValue={entry?.url || ""}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
                placeholder="Link to degree/cert verification"
              />
            </div>
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
              {isSubmitting ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
