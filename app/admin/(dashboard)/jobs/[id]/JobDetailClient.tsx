"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiCvVersion, ApiJob, JOB_STATUSES, JobStatus } from "@/lib/api";
import {
  generateJobCoverLetterAction,
  generateJobCvAction,
  getJobAction,
  qaJobAction,
  renderCoverLetterPdfAction,
  renderCvPdfAction,
  updateJobAction,
} from "@/app/actions/jobs";

const DOC_LABELS: Record<string, { label: string; color: string }> = {
  cv:           { label: "Tailored CV",    color: "bg-[var(--accent-violet)]/15 text-[var(--accent-violet)]" },
  cv_one_page:  { label: "One-Page CV",    color: "bg-yellow-500/15 text-yellow-300" },
  cover_letter: { label: "Cover Letter",   color: "bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)]" },
};

function DocKindLabel({ kind }: { kind: string }) {
  const { label, color } = DOC_LABELS[kind] ?? { label: kind, color: "bg-[var(--border-subtle)] text-[var(--text-secondary)]" };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {label}
    </span>
  );
}

export default function JobDetailClient({
  initialJob,
  initialCvVersions,
}: {
  initialJob: ApiJob;
  initialCvVersions: ApiCvVersion[];
}) {
  const router = useRouter();
  const [job, setJob] = useState<ApiJob>(initialJob);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [notes, setNotes] = useState(job.notes ?? "");
  const [coverLetter, setCoverLetter] = useState(job.cover_letter_text ?? "");
  const [followUpAt, setFollowUpAt] = useState(job.follow_up_at ?? "");
  const [copied, setCopied] = useState(false);
  // Document history — server-loaded, then augmented by in-session generations
  const [cvVersions, setCvVersions] = useState<ApiCvVersion[]>(initialCvVersions);
  // QA state
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaHint, setQaHint] = useState("");
  const [qaHistory, setQaHistory] = useState<{ question: string; hint: string; answer: string }[]>([]);

  async function save(data: Parameters<typeof updateJobAction>[1]) {
    setBusy("save");
    setError(null);
    setInfo(null);
    const res = await updateJobAction(job.id, data);
    setBusy(null);
    if (res.error) { setError(res.error); return; }
    if (res.data) {
      setJob(res.data as ApiJob);
      setInfo("Saved.");
      router.refresh();
    }
  }

  // Prepend a new version (pdf_url null) and return the inserted item so callers can use it
  function addCvVersion(id: string, kind: ApiCvVersion["kind"], locale: string): ApiCvVersion {
    const item: ApiCvVersion = { id, kind, locale, pdf_url: null, created_at: new Date().toISOString() };
    setCvVersions((prev) => [item, ...prev]);
    return item;
  }

  function setCvVersionPdfUrl(id: string, pdf_url: string) {
    setCvVersions((prev) => prev.map((v) => (v.id === id ? { ...v, pdf_url } : v)));
  }

  async function runGenerateCv() {
    setBusy("cv");
    setError(null);
    setInfo(null);
    const res = await generateJobCvAction(job.id, { locale: "auto" });
    setBusy(null);
    if (res.error) { setError(res.error); return; }
    if (res.data) {
      addCvVersion(res.data.cv_version_id, "cv", res.data.locale);
      setInfo("CV generated — click \"Render PDF\" in the Documents section to download.");
    }
    router.refresh();
  }

  async function runGenerateCvOnePage() {
    setBusy("cv-one");
    setError(null);
    setInfo(null);
    const res = await generateJobCvAction(job.id, { locale: "auto", mode: "one_page" });
    setBusy(null);
    if (res.error) { setError(res.error); return; }
    if (res.data) {
      addCvVersion(res.data.cv_version_id, "cv_one_page", res.data.locale);
      setInfo("One-page CV generated — click \"Render PDF\" in the Documents section to download.");
    }
    router.refresh();
  }

  async function runGenerateCoverLetter() {
    setBusy("cl");
    setError(null);
    setInfo(null);
    const res = await generateJobCoverLetterAction(job.id, { locale: "auto" });
    setBusy(null);
    if (res.error) { setError(res.error); return; }
    if (res.data) {
      addCvVersion(res.data.cv_version_id, "cover_letter", res.data.locale);
    }
    // Refetch so the cover letter textarea gets populated immediately.
    const jobRes = await getJobAction(job.id);
    if (jobRes.data) {
      const updated = jobRes.data as ApiJob;
      setJob(updated);
      setCoverLetter(updated.cover_letter_text ?? "");
    }
    setInfo("Cover letter generated — review and edit it in the Cover letter section below. Click \"Render PDF\" in Documents to download.");
    router.refresh();
  }

  async function runGenerateBoth() {
    setBusy("both");
    setError(null);
    setInfo(null);
    const [cvRes, clRes] = await Promise.all([
      generateJobCvAction(job.id, { locale: "auto" }),
      generateJobCoverLetterAction(job.id, { locale: "auto" }),
    ]);
    setBusy(null);

    if (cvRes.data) addCvVersion(cvRes.data.cv_version_id, "cv", cvRes.data.locale);
    if (clRes.data) addCvVersion(clRes.data.cv_version_id, "cover_letter", clRes.data.locale);

    // Refetch to sync cover letter text.
    const jobRes = await getJobAction(job.id);
    if (jobRes.data) {
      const updated = jobRes.data as ApiJob;
      setJob(updated);
      setCoverLetter(updated.cover_letter_text ?? "");
    }

    const errors = [cvRes.error, clRes.error].filter(Boolean);
    if (errors.length === 2) {
      setError(errors.join(" | "));
    } else if (errors.length === 1) {
      setError(errors[0]!);
      setInfo(cvRes.error ? "Cover letter generated." : "CV generated.");
    } else {
      setInfo("CV and cover letter generated — see Documents below to render PDFs.");
    }
    router.refresh();
  }

  async function handleRenderPdf(doc: ApiCvVersion) {
    setBusy(`pdf-${doc.id}`);
    setError(null);
    const res = doc.kind === "cv"
      ? await renderCvPdfAction(doc.id)
      : await renderCoverLetterPdfAction(doc.id);
    setBusy(null);
    if (res.error) { setError(res.error); return; }
    if (res.data?.pdf_url) setCvVersionPdfUrl(doc.id, res.data.pdf_url);
  }

  async function handleAskQa() {
    if (!qaQuestion.trim()) return;
    setBusy("qa");
    setError(null);
    setInfo(null);
    const res = await qaJobAction(job.id, { question: qaQuestion.trim(), hint: qaHint.trim() });
    setBusy(null);
    if (res.error) { setError(res.error); return; }
    if (res.data) {
      setQaHistory((prev) => [{ ...res.data!, hint: qaHint.trim() }, ...prev]);
      setQaQuestion("");
      // Hint is kept so the user can reuse it for the next question.
    }
  }

  async function handleRegenerateQa(index: number) {
    const item = qaHistory[index];
    if (!item) return;
    setBusy(`qa-regen-${index}`);
    setError(null);
    const res = await qaJobAction(job.id, { question: item.question, hint: item.hint });
    setBusy(null);
    if (res.error) { setError(res.error); return; }
    if (res.data) {
      setQaHistory((prev) =>
        prev.map((h, i) => (i === index ? { question: item.question, hint: item.hint, answer: res.data!.answer } : h))
      );
    }
  }

  async function handleCopyCoverLetter() {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{job.title}</h1>
        <p className="text-[var(--text-secondary)]">
          {job.company}
          {job.location ? ` · ${job.location}` : ""}
        </p>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--accent-cyan)] hover:underline"
        >
          Open posting ↗
        </a>
      </header>

      {/* ── Top cards ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <div className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-1">
            Match score
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {(job.match_score * 100).toFixed(0)}%
          </div>
          {job.match_explanation && (
            <div className="mt-2 space-y-1">
              {job.match_explanation.split("\n").filter(Boolean).map((line, i) => (
                <p key={i} className="text-xs italic text-[var(--text-secondary)]">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <label className="block text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">
            Status
          </label>
          <select
            value={job.status}
            onChange={(e) => save({ status: e.target.value as JobStatus })}
            disabled={busy === "save"}
            className="w-full px-3 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
          >
            {JOB_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {job.applied_at && (
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Applied {new Date(job.applied_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <div className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">
            Generate
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={runGenerateCv}
              disabled={!!busy}
              className="px-3 py-2 rounded-md border border-[var(--border-strong)] text-sm text-[var(--text-primary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] disabled:opacity-50"
            >
              {busy === "cv" ? "Generating CV…" : "Generate tailored CV"}
            </button>
            <button
              onClick={runGenerateCvOnePage}
              disabled={!!busy}
              className="px-3 py-2 rounded-md border border-yellow-500/50 text-sm text-yellow-300 hover:border-yellow-400 hover:text-yellow-200 disabled:opacity-50 transition-colors"
            >
              {busy === "cv-one" ? "Generating…" : "Generate one-page CV"}
            </button>
            <button
              onClick={runGenerateCoverLetter}
              disabled={!!busy}
              className="px-3 py-2 rounded-md border border-[var(--border-strong)] text-sm text-[var(--text-primary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] disabled:opacity-50"
            >
              {busy === "cl" ? "Generating cover letter…" : "Generate cover letter"}
            </button>
            <button
              onClick={runGenerateBoth}
              disabled={!!busy}
              className="px-3 py-2 rounded-md bg-[var(--accent-violet)] text-white text-sm hover:bg-[var(--accent-violet)]/90 disabled:opacity-50 transition-colors"
            >
              {busy === "both" ? "Generating both…" : "Generate CV + cover letter"}
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/40 text-sm text-red-300">
          {error}
        </div>
      )}
      {info && !error && (
        <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-sm text-emerald-300">
          {info}
        </div>
      )}

      {/* ── Documents history ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3">
          Documents
        </h2>
        {cvVersions.length === 0 ? (
          <p className="text-xs text-[var(--text-secondary)] italic">
            No documents yet — use the Generate buttons above to create a tailored CV or cover letter.
          </p>
        ) : (
          <div className="space-y-2">
            {cvVersions.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2"
              >
                <DocKindLabel kind={doc.kind} />
                <span className="text-xs text-[var(--text-secondary)] uppercase">{doc.locale}</span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {new Date(doc.created_at).toLocaleString()}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  {doc.pdf_url ? (
                    <a
                      href={doc.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                    >
                      Download PDF ↗
                    </a>
                  ) : (
                    <button
                      onClick={() => handleRenderPdf(doc)}
                      disabled={busy === `pdf-${doc.id}`}
                      className="text-xs px-3 py-1 rounded-md bg-[var(--accent-cyan)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-50 transition-colors"
                    >
                      {busy === `pdf-${doc.id}` ? "Rendering…" : "Render PDF"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          Re-rendering a PDF from a saved document is free — it re-runs WeasyPrint on the stored HTML without calling the AI again.
        </p>
      </section>

      {/* ── Application Q&A ── */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          Application Q&amp;A
        </h2>
        <p className="text-xs text-[var(--text-secondary)]">
          Paste an employer application question and get a grounded first-person answer
          based on your real experience. Edit the answer before submitting.
        </p>
        <textarea
          value={qaQuestion}
          onChange={(e) => setQaQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAskQa();
          }}
          rows={3}
          placeholder="e.g. Why do you want to work here? What's your biggest strength?"
          className="w-full px-3 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm resize-none"
        />
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={qaHint}
              onChange={(e) => setQaHint(e.target.value)}
              placeholder="Optional hint — e.g. mention TypeScript, keep under 200 words"
              className="w-full px-3 py-2 pr-8 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm"
            />
            {qaHint && (
              <button
                onClick={() => setQaHint("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm leading-none"
                title="Clear hint"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={handleAskQa}
            disabled={busy === "qa" || !qaQuestion.trim()}
            className="px-4 py-2 rounded-md bg-[var(--accent-violet)] text-white text-sm hover:bg-[var(--accent-violet)]/90 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {busy === "qa" ? "Generating…" : "Ask (⌘↵)"}
          </button>
        </div>
        {qaHistory.length > 0 && (
          <div className="space-y-4 pt-2">
            {qaHistory.map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Q</p>
                    <p className="text-sm text-[var(--text-primary)]">{item.question}</p>
                    {item.hint && (
                      <p className="text-xs text-[var(--text-secondary)] italic">Hint: {item.hint}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRegenerateQa(i)}
                    disabled={!!busy}
                    className="shrink-0 text-xs px-2.5 py-1 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] disabled:opacity-40 transition-colors"
                  >
                    {busy === `qa-regen-${i}` ? "Regenerating…" : "Regenerate"}
                  </button>
                </div>
                <p className="text-xs font-semibold text-[var(--accent-cyan)] uppercase tracking-wide">A</p>
                <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{item.answer}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Follow-up + applied date ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-2">
            Follow-up date
          </label>
          <input
            type="date"
            value={followUpAt}
            onChange={(e) => setFollowUpAt(e.target.value)}
            onBlur={() => {
              const val = followUpAt || null;
              if (val !== (job.follow_up_at ?? null)) save({ follow_up_at: val });
            }}
            className="w-full px-3 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm"
          />
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Leave blank for no reminder. Shown as overdue in the kanban if past today.
          </p>
        </div>
        {job.applied_at && (
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-2">Applied</p>
            <p className="text-sm text-[var(--text-primary)]">
              {new Date(job.applied_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </section>

      {/* ── Notes ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-2">
          Notes
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (notes !== (job.notes ?? "")) save({ notes });
          }}
          rows={4}
          className="w-full px-3 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm"
          placeholder="Private notes — recruiter contact, interview prep, follow-up dates…"
        />
      </section>

      {/* ── Cover letter ── */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Cover letter
          </h2>
          {coverLetter && (
            <button
              onClick={handleCopyCoverLetter}
              className="text-xs px-3 py-1 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
            >
              {copied ? "Copied ✓" : "Copy text"}
            </button>
          )}
        </div>
        {!coverLetter && (
          <p className="text-xs text-[var(--text-secondary)] mb-2 italic">
            No cover letter yet — use the Generate button above to create one.
          </p>
        )}
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          onBlur={() => {
            if (coverLetter !== (job.cover_letter_text ?? ""))
              save({ cover_letter_text: coverLetter });
          }}
          rows={12}
          className="w-full px-3 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-mono"
          placeholder="Generate one with the button above, then edit before sending."
        />
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Edits auto-save on blur. To download as PDF, use the Render PDF button in the Documents section above.
        </p>
      </section>

      {/* ── Job description ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-2">
          Job description
        </h2>
        <pre className="whitespace-pre-wrap text-sm text-[var(--text-primary)] bg-[var(--bg-elevated)] rounded-md p-4 border border-[var(--border-subtle)] max-h-96 overflow-y-auto">
          {job.jd_text}
        </pre>
      </section>
    </div>
  );
}
