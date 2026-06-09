"use server";

import {
  type ApiQaPair,
  createQaPair,
  updateQaPair,
  deleteQaPair,
  generateQaFromProfile,
  getQaPairs,
} from "@/lib/adminApi";

export async function getQaPairsAction(): Promise<ApiQaPair[]> {
  return getQaPairs();
}

export async function createQaPairAction(payload: { question: string | Record<string, string>; answer: string | Record<string, string> }): Promise<ApiQaPair> {
  return createQaPair(payload);
}

export async function updateQaPairAction(id: string, payload: { question?: string | Record<string, string>; answer?: string | Record<string, string> }): Promise<ApiQaPair> {
  return updateQaPair(id, payload);
}

export async function deleteQaPairAction(id: string): Promise<void> {
  return deleteQaPair(id);
}

export async function generateQaFromProfileAction(): Promise<ApiQaPair[]> {
  return generateQaFromProfile();
}
