"use server";

import { submitContact, ContactSubmission } from "@/lib/api";
import { replyToContact } from "@/lib/adminApi";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ReplySchema = z.object({
  message: z.string().min(1, "Reply message cannot be empty"),
});

export async function submitContactAction(data: ContactSubmission) {
  // Simple server-side validation
  if (!data.name || !data.email || !data.message) {
    return { success: false, message: "Please fill in all required fields." };
  }

  const res = await submitContact(data);
  return res;
}

export async function replyToContactAction(id: string, formData: FormData) {
  const message = formData.get("message") as string;
  
  const validation = ReplySchema.safeParse({ message });
  if (!validation.success) {
    return { success: false, message: validation.error.issues[0].message };
  }

  try {
    await replyToContact(id, message);
    revalidatePath(`/admin/messages/${id}`);
    revalidatePath("/admin/messages");
    return { success: true, message: "Reply sent successfully!" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, message: errorMessage };
  }
}
