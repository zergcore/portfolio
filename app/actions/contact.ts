"use server";

import { submitContact, ContactSubmission } from "@/lib/api";

export async function submitContactAction(data: ContactSubmission) {
  // Simple server-side validation
  if (!data.name || !data.email || !data.message) {
    return { success: false, message: "Please fill in all required fields." };
  }

  const res = await submitContact(data);
  return res;
}
