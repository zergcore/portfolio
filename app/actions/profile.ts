"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { updateProfile } from "@/lib/api";
import { ProfileUpdate } from "@/lib/api";

export async function updateProfileAction(data: ProfileUpdate) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return { error: "Not authenticated" };
  }

  const res = await updateProfile(data, token);

  if (!res) {
    return { error: "Failed to update profile" };
  }

  revalidatePath("/");
  revalidatePath("/admin/profile");
  return { success: true, data: res };
}
