"use client";

import { useState } from "react";
import { generateCv, renderCvPdf, type CvGenerateResponse } from "@/lib/adminApi";

type Step = "idle" | "fetching_jd" | "parsing_jd" | "matching" | "done" | "error";

const STEPS: Record<string, string> = {
  fetching_jd: "Fetching JD…",
  parsing_jd: "Extracting keywords…",
  matching: "Selecting bullets…",
  done: "Done",
};

export default function CvGeneratePage() {
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [locale, setLocale] = useState<"en" | "es">("en");
  const [bulletsPerRole, setBulletsPerRole] = useState(3);

  const [step, setStep] = useState<Step>("idle");
  const [result, setResult] = useState<CvGenerateResponse | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!jdText.trim() && !jdUrl.trim()) return;
    setStep(jdUrl.trim() ? "fetching_jd" : "parsing_jd");
    setError(null);
    setResult(null);
    setPdfUrl(null);

    try {
      setStep("parsing_jd");
      // Brief artificial step transition so the user sees progress labels
      await new Promise((r) => setTimeout(r, 100));
      setStep("matching");
      const data = await generateCv({
        jd_text: jdText.trim() || undefined,
        jd_url: jdUrl.trim() || undefined,
        locale,
        bullets_per_role: bulletsPerRole,
      });
      setResult(data);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStep("error");
    }
  }

  async function handleRenderPdf() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { pdf_url } = await renderCvPdf(result.cv_version_id);
      setPdfUrl(pdf_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF render failed");
    } finally {
      setPdfLoading(false);
    }
  }

  const isLoading = step !== "idle" && step !== "done" && step !== "error";
  const stepLabel = step !== "idle" && step !== "done" && step !== "error"
    ? STEPS[step]
    : "";

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">CV Generator</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Paste a job description (text or URL) and get a tailored, ATS-friendly CV.
        </p>
      </div>

      {/* ── Form ──────────────────────────────────────────────────── */}
      <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Job Description
          </label>
          <textarea
            rows={8}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the job description here…"
            disabled={isLoading}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] disabled:opacity-50 resize-y"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <div className="h-px flex-1 bg-[var(--border-default)]" />
          <span>or</span>
          <div className="h-px flex-1 bg-[var(--border-default)]" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            JD URL
          </label>
          <input
            type="url"
            value={jdUrl}
            onChange={(e) => setJdUrl(e.target.value)}
            placeholder="https://boards.greenhouse.io/…"
            disabled={isLoading}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] disabled:opacity-50"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Output Language
            </label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as "en" | "es")}
              disabled={isLoading}
              className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] disabled:opacity-50"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Bullets per role
            </label>
            <select
              value={bulletsPerRole}
              onChange={(e) => setBulletsPerRole(Number(e.target.value))}
              disabled={isLoading}
              className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] disabled:opacity-50"
            >
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={isLoading || (!jdText.trim() && !jdUrl.trim())}
            className="px-5 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                {stepLabel}
              </>
            ) : (
              "Generate CV"
            )}
          </button>

          {result && !isLoading && (
            <button
              onClick={handleGenerate}
              className="px-4 py-2 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Regenerate
            </button>
          )}
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────── */}
      {step === "error" && error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ── Result ────────────────────────────────────────────────── */}
      {result && step === "done" && (
        <div className="space-y-4">
          {result.warning && (
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-sm text-yellow-700 dark:text-yellow-400">
              <span className="font-semibold">Note: </span>{result.warning}
            </div>
          )}

          {/* Detected keywords summary */}
          {(result.jd_structured as Record<string, string[]>).must_have_skills?.length > 0 && (
            <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] p-4">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Detected JD Signals
              </p>
              <div className="flex flex-wrap gap-1.5">
                {((result.jd_structured as Record<string, string[]>).must_have_skills ?? []).map(
                  (s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium"
                    >
                      {s}
                    </span>
                  )
                )}
                {((result.jd_structured as Record<string, string[]>).nice_to_have_skills ?? []).map(
                  (s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-full bg-[var(--border-default)] text-[var(--text-muted)] text-xs"
                    >
                      {s}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {/* PDF download */}
          <div className="flex items-center gap-3">
            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Download PDF
              </a>
            ) : (
              <button
                onClick={handleRenderPdf}
                disabled={pdfLoading}
                className="px-5 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
              >
                {pdfLoading ? (
                  <>
                    <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                    Rendering PDF…
                  </>
                ) : (
                  "Download PDF"
                )}
              </button>
            )}
            <span className="text-xs text-[var(--text-muted)]">
              ID: <code className="text-[var(--accent-cyan)] text-xs">{result.cv_version_id}</code>
            </span>
          </div>

          {/* HTML preview */}
          <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] overflow-hidden">
            <div className="px-4 py-2 border-b border-[var(--border-default)]">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                CV Preview
              </p>
            </div>
            <iframe
              srcDoc={result.html}
              title="CV Preview"
              className="w-full h-[700px] bg-white"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
}
