"use client";

import { useState } from "react";
import { updateProfileAction } from "@/app/actions/profile";
import { Profile } from "@/lib/api";
import Button from "@/components/ui/Button";
import ImageUpload from "@/components/admin/ImageUpload";
import { FiSave, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

interface ProfileFormProps {
  initialProfile: Profile | null;
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialProfile?.imageUrl || "");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      title: fd.get("title") as string,
      bio: fd.get("bio") as string,
      email: fd.get("email") as string,
      location: fd.get("location") as string,
      github_url: (fd.get("github_url") as string) || null,
      linkedin_url: (fd.get("linkedin_url") as string) || null,
      whatsapp_number: (fd.get("whatsapp_number") as string) || null,
      cv_url: (fd.get("cv_url") as string) || null,
      image_url: (fd.get("image_url") as string) || null,
    };

    const res = await updateProfileAction(data);
    setIsSubmitting(false);

    if (res.error) {
      setStatus({ type: "error", message: res.error });
    } else {
      setStatus({ type: "success", message: "Profile updated successfully!" });
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-10">
      {status && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          status.type === "success" 
            ? "bg-green-500/10 border border-green-500/20 text-green-400" 
            : "bg-red-500/10 border border-red-500/20 text-red-400"
        }`}>
          {status.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      {/* Basic Info */}
      <section>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)]" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Full Name</label>
            <input
              name="name"
              defaultValue={initialProfile?.name}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-cyan)] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Professional Title</label>
            <input
              name="title"
              defaultValue={initialProfile?.title}
              required
              placeholder="e.g. Senior Full-Stack Engineer"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-cyan)] outline-none transition-all"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Bio / About Me</label>
            <textarea
              name="bio"
              defaultValue={initialProfile?.bio}
              required
              rows={5}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-cyan)] outline-none transition-all resize-none"
            />
          </div>
        </div>
      </section>

      {/* Contact & Location */}
      <section>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-violet)]" />
          Contact & Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Email Address</label>
            <input
              name="email"
              type="email"
              defaultValue={initialProfile?.email}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-cyan)] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Location</label>
            <input
              name="location"
              defaultValue={initialProfile?.location}
              required
              placeholder="e.g. Caracas, Venezuela"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-cyan)] outline-none transition-all"
            />
          </div>
        </div>
      </section>

      {/* Media & Socials */}
      <section>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          Media & Social Links
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <ImageUpload
              label="Profile Photo"
              value={imageUrl}
              onChange={setImageUrl}
            />
            <input type="hidden" name="image_url" value={imageUrl} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">CV / Resume URL</label>
            <input
              name="cv_url"
              defaultValue={initialProfile?.cvUrl}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-cyan)] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">GitHub URL</label>
            <input
              name="github_url"
              defaultValue={initialProfile?.githubUrl}
              placeholder="https://github.com/..."
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-cyan)] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">LinkedIn URL</label>
            <input
              name="linkedin_url"
              defaultValue={initialProfile?.linkedinUrl}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-cyan)] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">WhatsApp Number</label>
            <input
              name="whatsapp_number"
              defaultValue={initialProfile?.whatsappNumber}
              placeholder="e.g. 584121234567"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-cyan)] outline-none transition-all"
            />
          </div>
        </div>
      </section>

      <div className="pt-6 border-t border-[var(--border-subtle)] flex justify-end">
        <Button
          type="submit"
          isLoading={isSubmitting}
          icon={<FiSave />}
          className="px-8"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
