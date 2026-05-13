"use client";

import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiX } from "react-icons/fi";
import Button from "@/components/ui/Button";
import DateField from "@/components/admin/forms/DateField";
import CheckboxField from "@/components/admin/forms/CheckboxField";
import LocalizedTextField from "@/components/admin/forms/LocalizedTextField";
import { EducationCreate } from "@/lib/schemas/education";
import { createEducationAction, updateEducationAction } from "@/app/actions/education";
import { ApiEducation } from "@/lib/api";

interface Props {
  entry: ApiEducation | null;
  onClose: () => void;
  onSuccess: (e: ApiEducation) => void;
}

export default function EducationFormModal({ entry, onClose, onSuccess }: Props) {
  const methods = useForm<EducationCreate>({
    resolver: zodResolver(EducationCreate) as Resolver<EducationCreate>,
    defaultValues: entry
      ? {
          type: entry.type,
          degree: entry.degree,
          institution: entry.institution,
          start_date: entry.start_date ?? null,
          end_date: entry.end_date ?? null,
          is_current: entry.is_current,
          status: entry.status ?? null,
          status_note: entry.status_note ?? null,
          description: entry.description,
          image_url: entry.image_url ?? null,
          url: entry.url ?? null,
          related_project_ids: entry.related_project_ids ?? null,
          sort_order: entry.sort_order,
        }
      : {
          type: "degree",
          degree: { en: "", es: "" },
          institution: "",
          start_date: null,
          end_date: null,
          is_current: false,
          status: null,
          status_note: null,
          description: { en: "", es: "" },
          image_url: null,
          url: null,
          related_project_ids: null,
          sort_order: 0,
        },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const type = watch("type");
  const isCurrent = watch("is_current");
  const status = watch("status");
  const isDegree = type === "degree";

  const onSubmit = async (data: EducationCreate) => {
    const payload = {
      ...data,
      end_date: isCurrent ? null : data.end_date,
      status: isDegree ? data.status : null,
      status_note: isDegree && data.status ? data.status_note : null,
    };

    const res = entry
      ? await updateEducationAction(entry.id, payload)
      : await createEducationAction(payload);

    if (!res.success) {
      methods.setError("root", { message: res.error });
    } else {
      onSuccess(res.data);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <div className="sticky top-0 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] p-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {entry ? "Edit Education Entry" : "New Education Entry"}
          </h2>
          <button onClick={onClose} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {errors.root && (
              <div className="p-3 rounded-lg bg-[var(--color-error)]/10 text-[var(--color-error)] text-sm font-medium">
                {errors.root.message}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Type</label>
              <select
                {...register("type")}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              >
                <option value="degree">Degree / Academic</option>
                <option value="certification">Certification / Professional</option>
              </select>
            </div>

            <LocalizedTextField
              name="degree"
              label={isDegree ? "Degree / Title" : "Certification / Course"}
              required
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Institution / Issuer *</label>
              <input
                {...register("institution")}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
                placeholder={isDegree ? "e.g. Stanford University" : "e.g. AWS, Google, Udemy"}
              />
              {errors.institution && <p className="text-xs text-[var(--color-error)]">{errors.institution.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DateField
                label={isDegree ? "Start date" : "Issued date"}
                {...register("start_date")}
                error={errors.start_date?.message}
              />
              {isDegree && (
                <DateField
                  label="End date"
                  {...register("end_date")}
                  disabled={isCurrent}
                  error={errors.end_date?.message}
                />
              )}
            </div>

            {isDegree && (
              <CheckboxField
                label="Currently studying"
                {...register("is_current")}
                onChange={(e) => {
                  setValue("is_current", e.target.checked);
                  if (e.target.checked) setValue("end_date", null);
                }}
              />
            )}

            {isDegree && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Status</label>
                <select
                  {...register("status")}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
                >
                  <option value="">— none —</option>
                  <option value="in_course">In course</option>
                  <option value="graduated">Graduated</option>
                  <option value="unfinished">Unfinished</option>
                </select>
              </div>
            )}

            {isDegree && status && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Status note</label>
                <input
                  {...register("status_note")}
                  maxLength={200}
                  placeholder="Optional clarification"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
                />
              </div>
            )}

            <LocalizedTextField
              name="description"
              label="Description"
              multiline
              rows={3}
              placeholder={{ en: "Briefly describe your focus or achievements…", es: "Describe brevemente tu enfoque o logros…" }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Image URL</label>
                <input
                  {...register("image_url")}
                  placeholder="Institution logo URL"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Verification URL</label>
                <input
                  {...register("url")}
                  placeholder="Link to degree/cert verification"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
                />
              </div>
            </div>

            <details className="text-sm text-[var(--text-muted)]">
              <summary className="cursor-pointer hover:text-[var(--text-secondary)]">Advanced</summary>
              <div className="mt-3 space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Sort order (tie-breaker)</label>
                <input
                  {...register("sort_order", { valueAsNumber: true })}
                  type="number"
                  className="w-32 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
                />
              </div>
            </details>

            <div className="pt-6 border-t border-[var(--border-subtle)] flex justify-end gap-3">
              <Button type="button" onClick={onClose} className="bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)]">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save Entry"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
