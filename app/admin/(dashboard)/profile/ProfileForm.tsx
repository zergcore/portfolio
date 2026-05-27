"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslations } from "next-intl";
import { updateProfileAction } from "@/app/actions/profile";
import { Profile } from "@/lib/api";
import Button from "@/components/ui/Button";
import ImageUpload from "@/components/admin/ImageUpload";
import ResumeUpload from "@/components/admin/ResumeUpload";
import LocalizedTextField from "@/components/admin/forms/LocalizedTextField";
import { FiSave, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

interface ProfileFormProps {
  initialProfile: Profile | null;
}

export interface ProfileFormData {
  name: string;
  title: { en: string; es: string };
  bio: { en: string; es: string };
  email: string;
  location: { en: string; es: string };
  github_url: string;
  linkedin_url: string;
  whatsapp_number: string;
  meeting_url: string;
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const t = useTranslations("adminProfile");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialProfile?.imageUrl || "");
  const [cvUrl, setCvUrl] = useState(initialProfile?.cvUrl || "");
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const methods = useForm<ProfileFormData>({
    defaultValues: {
      name: initialProfile?.name || "",
      title: initialProfile?.title || { en: "", es: "" },
      bio: initialProfile?.bio || { en: "", es: "" },
      email: initialProfile?.email || "",
      location: initialProfile?.location || { en: "", es: "" },
      github_url: initialProfile?.githubUrl || "",
      linkedin_url: initialProfile?.linkedinUrl || "",
      whatsapp_number: initialProfile?.whatsappNumber || "",
      meeting_url: initialProfile?.meetingUrl || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setStatus(null);

    // Filter out empty strings to send null instead for optional fields
    const payload = {
      ...data,
      github_url: (data.github_url as string) || null,
      linkedin_url: (data.linkedin_url as string) || null,
      whatsapp_number: (data.whatsapp_number as string) || null,
      meeting_url: (data.meeting_url as string) || null,
      cv_url: cvUrl || null,
      image_url: imageUrl || null,
    };

    const res = await updateProfileAction(payload);
    setIsSubmitting(false);

    if (res.error) {
      setStatus({ type: "error", message: res.error });
    } else {
      setStatus({ type: "success", message: t("successMessage") });
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="p-8 space-y-10"
      >
        {status && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
              status.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            {status.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        {/* Basic Info */}
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-(--accent-cyan)" />
            {t("basicInfo")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--text-secondary)">
                {t("fullName")}
              </label>
              <input
                {...methods.register("name")}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-(--bg-elevated) border border-(--border-subtle) focus:border-(--accent-cyan) outline-none transition-all"
              />
            </div>

            <LocalizedTextField
              name="title"
              label={t("profTitle")}
              required
              placeholder={{ en: t("titlePlaceholderEn"), es: t("titlePlaceholderEs") }}
            />

            <div className="md:col-span-2">
              <LocalizedTextField
                name="bio"
                label={t("bio")}
                multiline
                rows={5}
                required
                placeholder={{ en: t("bioPlaceholderEn"), es: t("bioPlaceholderEs") }}
              />
            </div>
          </div>
        </section>

        {/* Contact & Location */}
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-(--accent-violet)" />
            {t("contactLocation")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--text-secondary)">
                {t("email")}
              </label>
              <input
                {...methods.register("email")}
                type="email"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-(--bg-elevated) border border-(--border-subtle) focus:border-(--accent-cyan) outline-none transition-all"
              />
            </div>

            <LocalizedTextField
              name="location"
              label={t("location")}
              required
              placeholder={{ en: t("locationPlaceholderEn"), es: t("locationPlaceholderEs") }}
            />
          </div>
        </section>

        {/* Media & Socials */}
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            {t("mediaSocial")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <ImageUpload
                label={t("profilePhoto")}
                value={imageUrl}
                onChange={setImageUrl}
              />
            </div>
            <div className="md:col-span-2">
              <ResumeUpload
                label={t("resumeCv")}
                value={cvUrl}
                onChange={setCvUrl}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--text-secondary)">
                {t("github")}
              </label>
              <input
                {...methods.register("github_url")}
                placeholder={t("githubPlaceholder")}
                className="w-full px-4 py-2.5 rounded-lg bg-(--bg-elevated) border border-(--border-subtle) focus:border-(--accent-cyan) outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--text-secondary)">
                {t("linkedin")}
              </label>
              <input
                {...methods.register("linkedin_url")}
                placeholder={t("linkedinPlaceholder")}
                className="w-full px-4 py-2.5 rounded-lg bg-(--bg-elevated) border border-(--border-subtle) focus:border-(--accent-cyan) outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--text-secondary)">
                {t("whatsapp")}
              </label>
              <input
                {...methods.register("whatsapp_number")}
                placeholder={t("whatsappPlaceholder")}
                className="w-full px-4 py-2.5 rounded-lg bg-(--bg-elevated) border border-(--border-subtle) focus:border-(--accent-cyan) outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-(--text-secondary)">
                {t("meeting")}
              </label>
              <input
                {...methods.register("meeting_url")}
                type="url"
                placeholder={t("meetingPlaceholder")}
                className="w-full px-4 py-2.5 rounded-lg bg-(--bg-elevated) border border-(--border-subtle) focus:border-(--accent-cyan) outline-none transition-all"
              />
              <p className="text-xs text-(--text-muted)">
                {t("meetingHelper")}
              </p>
            </div>
          </div>
        </section>

        <div className="pt-6 border-t border-(--border-subtle) flex justify-end">
          <Button
            type="submit"
            isLoading={isSubmitting}
            icon={<FiSave />}
            className="px-8"
          >
            {t("saveChanges")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
