import { getProfile } from "@/lib/api";
import ProfileForm from "./ProfileForm";

export default async function AdminProfilePage() {
  const profile = await getProfile();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Profile Settings
        </h1>
        <p className="text-[var(--text-secondary)]">
          Manage your personal information, biography, and social media links.
        </p>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
        <ProfileForm initialProfile={profile} />
      </div>
    </div>
  );
}
