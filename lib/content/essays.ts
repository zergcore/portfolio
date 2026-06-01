'use cache';

import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife } from 'next/cache';
import type { ApiBlogPost } from '../api';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:8000/api/v1';

function authHeaders(): HeadersInit {
  if (process.env.API_SECRET) return { Authorization: `Bearer ${process.env.API_SECRET}` };
  return {};
}

export async function getAllEssays(): Promise<ApiBlogPost[]> {
  'use cache';
  cacheTag('essays');
  cacheLife('days');
  try {
    const res = await fetch(`${API_URL}/blog`, { headers: authHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data) ? data : data.items;
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function getEssay(slug: string): Promise<ApiBlogPost | null> {
  'use cache';
  cacheTag('essays');
  cacheLife('days');
  try {
    const res = await fetch(`${API_URL}/blog/${slug}`, { headers: authHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
