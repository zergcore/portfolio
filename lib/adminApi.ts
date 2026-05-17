import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return {
    "Authorization": `Bearer ${token}`
  };
}

export async function getAdminProjects() {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 }
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminBlogPosts() {
  // We hit the same endpoint but without is_published filter (backend usually handles this via auth/query)
  // Wait, looking at blog.py, list_posts only shows published posts.
  // I should probably add an admin-only endpoint to list all posts or add a param.
  
  // For now, let's just use the public one but we'll need the backend to support showing drafts for admins.
  const res = await fetch(`${API_BASE_URL}/blog/admin`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 }
  });
  if (!res.ok) return { items: [], total: 0 };
  return res.json();
}

export async function getAdminExperience() {
  const res = await fetch(`${API_BASE_URL}/experience`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 }
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminSkills() {
  const res = await fetch(`${API_BASE_URL}/skills/admin`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 }
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminSkillCategories() {
  const res = await fetch(`${API_BASE_URL}/skill-categories`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 }
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminEducation() {
  const res = await fetch(`${API_BASE_URL}/education`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 }
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminContacts() {
  const res = await fetch(`${API_BASE_URL}/contact`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 }
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminContact(id: string) {
  const res = await fetch(`${API_BASE_URL}/contact`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 }
  });
  if (!res.ok) return null;
  const contacts = await res.json();
  return contacts.find((c: { id: string }) => c.id === id) || null;
}

export async function replyToContact(id: string, message: string) {
  const res = await fetch(`${API_BASE_URL}/contact/${id}/reply`, {
    method: "POST",
    headers: {
      ...(await getAuthHeader()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to send reply");
  }
  return res.json();
}

export async function linkedinPreview(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const res = await fetch(`${API_BASE_URL}/imports/linkedin/preview`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Preview failed (${res.status})`);
  }
  return res.json();
}

export async function linkedinApply(payload: {
  import_session_id: string;
  actions: { row_id: string; action: "create" | "merge" | "skip"; target_id?: string }[];
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const res = await fetch(`${API_BASE_URL}/imports/linkedin/apply`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Apply failed (${res.status})`);
  }
  return res.json();
}

