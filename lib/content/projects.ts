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

export async function getHeroProject(): Promise<ApiProject | null> {
  'use cache';
  cacheTag('projects');
  cacheLife('days');
  const projects = await getAllProjects();
  const heroes = projects.filter((p) => p.tier === 'hero');
  if (heroes.length > 1) {
    throw new Error(`[work] Expected exactly 1 project with tier:"hero", found ${heroes.length}. Remove the tier field from all but one.`);
  }
  if (heroes.length === 1) return heroes[0];
  // Fallback: first featured project by sort_order, then any project
  const sorted = [...projects].sort((a, b) => a.sort_order - b.sort_order);
  return sorted.find((p) => p.is_featured) ?? sorted[0] ?? null;
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
