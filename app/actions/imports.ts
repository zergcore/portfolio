"use server";

import { linkedinPreview, linkedinApply } from "@/lib/adminApi";

export async function previewLinkedInZip(formData: FormData) {
  return linkedinPreview(formData);
}

export async function applyLinkedInImport(payload: {
  import_session_id: string;
  actions: { row_id: string; action: "create" | "merge" | "skip"; target_id?: string }[];
}) {
  return linkedinApply(payload);
}
