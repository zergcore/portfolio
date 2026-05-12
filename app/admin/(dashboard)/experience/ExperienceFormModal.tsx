"use client";

import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiX } from "react-icons/fi";
import Button from "@/components/ui/Button";
import DateField from "@/components/admin/forms/DateField";
import CheckboxField from "@/components/admin/forms/CheckboxField";
import LocalizedTextField from "@/components/admin/forms/LocalizedTextField";
import LocalizedListField from "@/components/admin/forms/LocalizedListField";
import { ExperienceCreate } from "@/lib/schemas/experience";
import { createExperienceAction, updateExperienceAction } from "@/app/actions/experience";
import { ApiExperience } from "@/lib/api";

interface Props {
  experience: ApiExperience | null;
  onClose: () => void;
  onSuccess: (e: ApiExperience) => void;
}

export default function ExperienceFormModal({ experience, onClose, onSuccess }: Props) {
  const methods = useForm<ExperienceCreate>({
    resolver: zodResolver(ExperienceCreate) as Resolver<ExperienceCreate>,
    defaultValues: experience
      ? {
          role: experience.role,
          company: experience.company,
          start_date: experience.start_date ?? "",
          end_date: experience.end_date ?? null,
          is_current: experience.is_current,
          description: experience.description,
          tech_stack: experience.tech_stack,
          sort_order: experience.sort_order,
        }
      : {
          role: { en: "", es: "" },
          company: "",
          start_date: "",
          end_date: null,
          is_current: false,
          description: { en: [], es: [] },
          tech_stack: [],
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

  const isCurrent = watch("is_current");

  const onSubmit = async (data: ExperienceCreate) => {
    const payload = {
      ...data,
      end_date: isCurrent ? null : data.end_date,
    };

    const res = experience
      ? await updateExperienceAction(experience.id, payload)
      : await createExperienceAction(payload);

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
            {experience ? "Edit Experience" : "New Experience"}
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

            <LocalizedTextField name="role" label="Role" required />

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Company *</label>
              <input
                {...register("company")}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              />
              {errors.company && <p className="text-xs text-[var(--color-error)]">{errors.company.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DateField
                label="Start date *"
                {...register("start_date")}
                error={errors.start_date?.message}
              />
              <DateField
                label="End date"
                {...register("end_date")}
                disabled={isCurrent}
                error={errors.end_date?.message}
              />
            </div>

            <CheckboxField
              label="Currently here"
              {...register("is_current")}
              onChange={(e) => {
                setValue("is_current", e.target.checked);
                if (e.target.checked) setValue("end_date", null);
              }}
            />

            <LocalizedListField
              name="description"
              label="Description (one bullet per line)"
              rows={5}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Tech stack (comma separated)</label>
              <input
                {...register("tech_stack")}
                defaultValue={experience?.tech_stack?.join(", ")}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
              />
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
                {isSubmitting ? "Saving…" : "Save Experience"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
