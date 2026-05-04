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
