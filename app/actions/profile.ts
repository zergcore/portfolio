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

  const res = await updateProfile(data as unknown as Parameters<typeof updateProfile>[0], token);

  if (!res) {
    return { error: "Failed to update profile" };
  }

  revalidatePath("/");
  revalidatePath("/admin/profile");
  return { success: true, data: res };
}
