"use server";

import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function uploadImageAction(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/uploads`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.detail || "Upload failed" };
    }

    return { success: true, url: data.url };
  } catch (error) {
    console.error("Upload action error:", error);
    return { success: false, error: "Connection to backend failed" };
  }
}
