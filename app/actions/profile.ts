"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { updateProfile } from "@/lib/api";

export async function updateProfileAction(data: Record<string, unknown>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return { error: "Not authenticated" };
  }

  // Wrap plain strings into localized objects for the backend
  const localizedData = {
    ...data,
    title: data.title ? { en: data.title as string, es: "" } : undefined,
    bio: data.bio ? { en: data.bio as string, es: "" } : undefined,
    location: data.location ? { en: data.location as string, es: "" } : undefined,
  };

  const res = await updateProfile(localizedData as unknown as Parameters<typeof updateProfile>[0], token);

  if (!res) {
    return { error: "Failed to update profile" };
  }

  revalidatePath("/");
  revalidatePath("/admin/profile");
  return { success: true, data: res };
}
