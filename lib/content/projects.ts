// Source of truth: backend database. Do not migrate to MDX. See CLAUDE.md.
'use cache';

import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife } from 'next/cache';
import type { ApiProject } from '../api';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:8000/api/v1';

function authHeaders(): HeadersInit {
  if (process.env.API_SECRET) return { Authorization: `Bearer ${process.env.API_SECRET}` };
  return {};
}

export async function getAllProjects(): Promise<ApiProject[]> {
  'use cache';
  cacheTag('projects');
  cacheLife('days');
  try {
    const res = await fetch(`${API_URL}/projects`, { headers: authHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getProject(slug: string): Promise<ApiProject | null> {
  'use cache';
  cacheTag('projects');
  cacheLife('days');
  try {
    const res = await fetch(`${API_URL}/projects/${slug}`, { headers: authHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
