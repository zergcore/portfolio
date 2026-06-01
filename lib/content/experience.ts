// Source of truth: backend database. Do not migrate to MDX. See CLAUDE.md.
'use cache';

import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife } from 'next/cache';
import type { ApiExperience } from '../api';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:8000/api/v1';

function authHeaders(): HeadersInit {
  if (process.env.API_SECRET) return { Authorization: `Bearer ${process.env.API_SECRET}` };
  return {};
}

export async function getAllRoles(): Promise<ApiExperience[]> {
  'use cache';
  cacheTag('experience');
  cacheLife('days');
  try {
    const res = await fetch(`${API_URL}/experience`, { headers: authHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getRole(slug: string): Promise<ApiExperience | null> {
  'use cache';
  cacheTag('experience');
  cacheLife('days');
  const roles = await getAllRoles();
  return roles.find((r) => r.id === slug) ?? null;
}
