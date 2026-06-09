"use client";

import { useState } from "react";
import type { ApiQaPair } from "@/lib/adminApi";
import {
  createQaPairAction,
  updateQaPairAction,
  deleteQaPairAction,
  generateQaFromProfileAction,
  getQaPairsAction,
} from "@/app/actions/qa";
import { useRouter } from "next/navigation";

export default function QaClient({
  initialPairs,
}: {
  initialPairs: ApiQaPair[];
}) {
  const router = useRouter();
  const [pairs, setPairs] = useState(initialPairs);
  const [editing, setEditing] = useState<ApiQaPair | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);

  // form state
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  function openNew() {
    setQuestion("");
    setAnswer("");
    setEditing("new");
  }

  function openEdit(p: ApiQaPair) {
    const q = typeof p.question === "string" ? p.question : (p.question as Record<string, string>)?.en || "";
    const a = typeof p.answer === "string" ? p.answer : (p.answer as Record<string, string>)?.en || "";
    setQuestion(q);
    setAnswer(a);
    setEditing(p);
  }

  function close() {
    setEditing(null);
    setQuestion("");
    setAnswer("");
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateQaFromProfileAction();
      router.refresh();
      const updated = await getQaPairsAction();
      setPairs(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate Q&A pairs");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        question: { en: question },
        answer: { en: answer },
      };
      if (editing === "new") {
        await createQaPairAction(payload);
      } else if (editing) {
        await updateQaPairAction(editing.id, payload);
      }
      router.refresh();
      const updated = await getQaPairsAction();
      setPairs(updated);
      close();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this Q&A pair?")) return;
    setBusy(true);
    try {
      await deleteQaPairAction(id);
      router.refresh();
      setPairs(pairs.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-(--accent-violet) text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
        >
          {generating ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Generating…
            </>
          ) : (
            "Generate from Profile (AI)"
          )}
        </button>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-(--accent-primary) text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Add Q&A Pair
        </button>
      </div>

      <div className="grid gap-4">
        {pairs.length === 0 ? (
          <div className="p-8 text-center border border-(--border-default) rounded-xl bg-(--bg-surface) text-(--text-secondary)">
            No Q&A pairs added yet.
          </div>
        ) : (
          pairs.map((p) => (
            <div
              key={p.id}
              className="p-4 border border-(--border-default) rounded-xl bg-(--bg-surface) hover:border-(--border-strong) transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2 flex-1">
                  <h3 className="font-semibold text-foreground">
                    Q: {typeof p.question === "string" ? p.question : (p.question as Record<string, string>)?.en}
                  </h3>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    A: {typeof p.answer === "string" ? p.answer : (p.answer as Record<string, string>)?.en}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="text-foreground hover:text-(--accent-primary) text-sm font-medium px-2 py-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-foreground hover:text-red-500 text-sm font-medium px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-(--bg-surface) rounded-xl border border-(--border-default) shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-(--border-default) flex justify-between items-center">
              <h2 className="font-bold text-lg text-foreground">
                {editing === "new" ? "Add Q&A Pair" : "Edit Q&A Pair"}
              </h2>
              <button
                onClick={close}
                className="text-foreground hover:text-foreground p-1"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 bg-(--bg-surface) border border-(--border-default) rounded-lg text-foreground focus:outline-none focus:border-(--accent-primary)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-(--text-secondary) mb-1">
                  Answer
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 bg-(--bg-surface) border border-(--border-default) rounded-lg text-foreground focus:outline-none focus:border-(--accent-primary) resize-y"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-(--border-default)">
                <button
                  type="button"
                  onClick={close}
                  className="px-4 py-2 text-(--text-secondary) hover:text-foreground font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 bg-(--accent-primary) text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {busy ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
