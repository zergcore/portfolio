"use client";

import { useState } from "react";
import {
  analyzeJdAction,
  confirmCvSkillsAction,
  generateCoverLetterAction,
  generateCvAction,
  renderCoverLetterPdfAction,
  renderCvPdfAction,
} from "@/app/actions/cv";
import type {
  CoverLetterResponse,
  CvAnalyzeResponse,
  CvGenerateResponse,
} from "@/lib/adminApi";

type Stage = "idle" | "analyzing" | "analyzed" | "generating" | "done" | "error";

type Want = "cv" | "cover_letter" | "both";

const STAGE_LABELS: Record<Stage, string> = {
  idle: "",
  analyzing: "Analyzing JD…",
  analyzed: "Confirm and generate",
  generating: "Generating…",
  done: "Done",
  error: "",
};

const LOCALE_LABEL: Record<"en" | "es", string> = { en: "English", es: "Español" };

export default function CvGeneratePage() {
  // Stage 1 inputs
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [bulletsPerRole, setBulletsPerRole] = useState(3);
  const [mode, setMode] = useState<"full" | "one_page">("full");
  const [aiRewrite, setAiRewrite] = useState(false);
  const [want, setWant] = useState<Want>("cv");

  // Stage 2 inputs
  const [locale, setLocale] = useState<"en" | "es">("en");
  const [haveKeyword, setHaveKeyword] = useState<Record<string, boolean>>({});
  const [saveKeyword, setSaveKeyword] = useState<Record<string, boolean>>({});

  // State machine
  const [stage, setStage] = useState<Stage>("idle");
  const [analysis, setAnalysis] = useState<CvAnalyzeResponse | null>(null);
  const [cvResult, setCvResult] = useState<CvGenerateResponse | null>(null);
  const [clResult, setClResult] = useState<CoverLetterResponse | null>(null);
  const [cvPdfUrl, setCvPdfUrl] = useState<string | null>(null);
  const [clPdfUrl, setClPdfUrl] = useState<string | null>(null);
  const [cvPdfLoading, setCvPdfLoading] = useState(false);
  const [clPdfLoading, setClPdfLoading] = useState(false);
  const [followupLoading, setFollowupLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [error, setError] = useState<string | null>(null);

  function resetResults() {
    setCvResult(null);
    setClResult(null);
    setCvPdfUrl(null);
    setClPdfUrl(null);
    setCopyStatus("idle");
  }

  async function runAnalyze(): Promise<CvAnalyzeResponse | null> {
    try {
      const data = await analyzeJdAction({
        jd_text: jdText.trim() || undefined,
        jd_url: jdUrl.trim() || undefined,
      });
      setAnalysis(data);
      setLocale(data.detected_language);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStage("error");
      return null;
    }
  }

  async function handleAnalyze() {
    if (!jdText.trim() && !jdUrl.trim()) return;
    setStage("analyzing");
    setError(null);
    setAnalysis(null);
    resetResults();
    setHaveKeyword({});
    setSaveKeyword({});
    const data = await runAnalyze();
    if (data) setStage("analyzed");
  }

  async function generateArtifacts(opts: {
    jdText: string;
    chosenLocale: "en" | "es";
    confirmedKeywords: string[];
    wantSel: Want;
  }) {
    const wantCv = opts.wantSel === "cv" || opts.wantSel === "both";
    const wantCl = opts.wantSel === "cover_letter" || opts.wantSel === "both";

    if (wantCv) {
      const data = await generateCvAction({
        jd_text: opts.jdText,
        locale: opts.chosenLocale,
        bullets_per_role: bulletsPerRole,
        mode,
        ai_rewrite: aiRewrite,
        confirmed_keywords: opts.confirmedKeywords,
      });
      setCvResult(data);
    }
    if (wantCl) {
      const data = await generateCoverLetterAction({
        jd_text: opts.jdText,
        locale: opts.chosenLocale,
        confirmed_keywords: opts.confirmedKeywords,
      });
      setClResult(data);
    }
  }

  async function handleGenerate() {
    if (!analysis) return;
    setStage("generating");
    setError(null);
    try {
      const skillsToSave = Object.entries(saveKeyword)
        .filter(([, v]) => v)
        .map(([k]) => k);
      if (skillsToSave.length > 0) {
        try {
          await confirmCvSkillsAction(skillsToSave);
        } catch (err) {
          console.warn("Failed to save some skills:", err);
        }
      }
      const confirmedKeywords = aiRewrite
        ? Object.entries(haveKeyword).filter(([, v]) => v).map(([k]) => k)
        : [];
      await generateArtifacts({
        jdText: analysis.jd_text,
        chosenLocale: locale,
        confirmedKeywords,
        wantSel: want,
      });
      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStage("error");
    }
  }

  async function handleLucky() {
    if (!jdText.trim() && !jdUrl.trim()) return;
    setStage("analyzing");
    setError(null);
    setAnalysis(null);
    resetResults();
    setHaveKeyword({});
    setSaveKeyword({});

    const analyzed = await runAnalyze();
    if (!analyzed) return;

    setStage("generating");
    try {
      await generateArtifacts({
        jdText: analyzed.jd_text,
        chosenLocale: analyzed.detected_language,
        confirmedKeywords: [],
        wantSel: want,
      });
      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStage("error");
    }
  }

  async function downloadCvPdf() {
    if (!cvResult) return;
    setCvPdfLoading(true);
    try {
      const { pdf_url } = await renderCvPdfAction(cvResult.cv_version_id);
      setCvPdfUrl(pdf_url);
      triggerDownload(pdf_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "CV PDF render failed");
    } finally {
      setCvPdfLoading(false);
    }
  }

  async function downloadCoverLetterPdf() {
    if (!clResult) return;
    setClPdfLoading(true);
    try {
      const { pdf_url } = await renderCoverLetterPdfAction(clResult.cover_letter_id);
      setClPdfUrl(pdf_url);
      triggerDownload(pdf_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover letter PDF render failed");
    } finally {
      setClPdfLoading(false);
    }
  }

  function triggerDownload(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function handleCopyCoverLetter() {
    if (!clResult?.body) return;
    try {
      await navigator.clipboard.writeText(clResult.body);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 1500);
    } catch {
      // fallback: select textarea so user can Ctrl+C
    }
  }

  // Follow-up: generate the artifact that wasn't generated, reusing the analyzed JD
  async function handleFollowupAddCoverLetter() {
    if (!analysis) return;
    setFollowupLoading(true);
    setError(null);
    try {
      const data = await generateCoverLetterAction({
        jd_text: analysis.jd_text,
        locale,
        confirmed_keywords: [],
      });
      setClResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover letter generation failed");
    } finally {
      setFollowupLoading(false);
    }
  }

  async function handleFollowupAddCv() {
    if (!analysis) return;
    setFollowupLoading(true);
    setError(null);
    try {
      const data = await generateCvAction({
        jd_text: analysis.jd_text,
        locale,
        bullets_per_role: bulletsPerRole,
        mode,
        ai_rewrite: aiRewrite,
        confirmed_keywords: [],
      });
      setCvResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "CV generation failed");
    } finally {
      setFollowupLoading(false);
    }
  }

  function handleStartOver() {
    setStage("idle");
    setAnalysis(null);
    resetResults();
    setError(null);
  }

  function toggleHave(kw: string) {
    setHaveKeyword((m) => ({ ...m, [kw]: !m[kw] }));
  }
  function toggleSave(kw: string) {
    setSaveKeyword((m) => ({ ...m, [kw]: !m[kw] }));
  }

  const inputsLocked = stage !== "idle" && stage !== "error";
  const busy = stage === "analyzing" || stage === "generating";
  const detectedLang = analysis?.detected_language ?? null;
  const jdStructured = (analysis?.jd_structured ?? cvResult?.jd_structured ?? clResult?.jd_structured) as
    | Record<string, string[]>
    | undefined;

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">CV & Cover Letter</h1>
        <p className="text-sm text-[var(--text-muted)]">
          One JD in, your choice of CV, cover letter, or both. Each is a distinct artifact with its own PDF.
        </p>
      </div>

      {/* Stage 1: JD input + options */}
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
            disabled={inputsLocked}
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
            disabled={inputsLocked}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] disabled:opacity-50"
          />
        </div>

        {/* What do you need? */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            What do you need?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { v: "cv", label: "CV only", hint: "PDF tailored to this JD" },
              { v: "cover_letter", label: "Cover letter only", hint: "PDF + copy-paste text" },
              { v: "both", label: "Both", hint: "Two separate artifacts" },
            ] as { v: Want; label: string; hint: string }[]).map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setWant(opt.v)}
                disabled={inputsLocked}
                className={`px-3 py-2.5 rounded-lg border text-left transition-colors disabled:opacity-50 ${
                  want === opt.v
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)]"
                    : "border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <div className="text-sm font-semibold">{opt.label}</div>
                <div className="text-xs mt-0.5 opacity-75">{opt.hint}</div>
              </button>
            ))}
          </div>
        </div>

        {/* CV-specific options (greyed when only cover letter selected) */}
        <div className={want === "cover_letter" ? "opacity-40 pointer-events-none" : ""}>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              CV Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setMode("full")} disabled={inputsLocked}
                className={`px-4 py-3 rounded-lg border text-left transition-colors disabled:opacity-50 ${
                  mode === "full"
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)]"
                    : "border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}>
                <div className="text-sm font-semibold">Full CV</div>
                <div className="text-xs mt-0.5 opacity-75">All experiences, JD-relevant bullets per role</div>
              </button>
              <button type="button" onClick={() => setMode("one_page")} disabled={inputsLocked}
                className={`px-4 py-3 rounded-lg border text-left transition-colors disabled:opacity-50 ${
                  mode === "one_page"
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)]"
                    : "border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}>
                <div className="text-sm font-semibold">1-Page CV</div>
                <div className="text-xs mt-0.5 opacity-75">Top experiences for this JD, 2 bullets each</div>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-end mt-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Bullets per role {mode === "one_page" && <span className="normal-case">(capped at 2)</span>}
              </label>
              <select value={bulletsPerRole} onChange={(e) => setBulletsPerRole(Number(e.target.value))}
                disabled={inputsLocked || mode === "one_page"}
                className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] disabled:opacity-50">
                {[2, 3, 4, 5].map((n) => (<option key={n} value={n}>{n}</option>))}
              </select>
            </div>
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={aiRewrite} onChange={(e) => setAiRewrite(e.target.checked)}
                disabled={inputsLocked}
                className="mt-1 accent-[var(--accent-primary)] disabled:opacity-50" />
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-[var(--text-primary)]">AI-rewrite bullets for this JD</span>
                <span className="text-xs text-[var(--text-muted)]">Each selected bullet gets one Gemini call. Strict no-fabrication rules.</span>
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {stage === "idle" || stage === "error" ? (
            <>
              <button onClick={handleAnalyze} disabled={!jdText.trim() && !jdUrl.trim()}
                className="px-5 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity">
                Analyze JD
              </button>
              <button onClick={handleLucky} disabled={!jdText.trim() && !jdUrl.trim()}
                title="Detect language and generate selected artifacts in one click"
                className="px-5 py-2 rounded-lg border border-[var(--accent-primary)] text-[var(--accent-primary)] text-sm font-semibold hover:bg-[var(--accent-primary)]/10 disabled:opacity-40 transition-colors">
                I&apos;m feeling lucky
              </button>
            </>
          ) : (
            <button onClick={handleStartOver} disabled={busy}
              className="px-4 py-2 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors">
              Start over
            </button>
          )}
          {busy && (
            <span className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <span className="animate-spin inline-block w-3 h-3 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full" />
              {STAGE_LABELS[stage]}
            </span>
          )}
        </div>
      </div>

      {stage === "error" && error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Stage 2 */}
      {analysis && (stage === "analyzed" || stage === "generating") && (
        <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--accent-primary)]/40 p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">Confirm output language</h2>
            <p className="text-xs text-[var(--text-muted)]">
              We detected the JD is in{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {detectedLang ? LOCALE_LABEL[detectedLang] : "—"}
              </span>. Override below if needed.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["en", "es"] as const).map((lng) => (
              <button key={lng} type="button" onClick={() => setLocale(lng)} disabled={stage === "generating"}
                className={`px-4 py-3 rounded-lg border text-left transition-colors disabled:opacity-50 ${
                  locale === lng
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)]"
                    : "border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}>
                <div className="text-sm font-semibold flex items-center gap-2">
                  {LOCALE_LABEL[lng]}
                  {lng === detectedLang && (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--accent-primary)]">detected</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {jdStructured?.must_have_skills && jdStructured.must_have_skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">JD signals</p>
              <div className="flex flex-wrap gap-1.5">
                {(jdStructured.must_have_skills ?? []).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium">{s}</span>
                ))}
                {(jdStructured.nice_to_have_skills ?? []).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-[var(--border-default)] text-[var(--text-muted)] text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}

          {aiRewrite && analysis.missing_keywords.length > 0 && want !== "cover_letter" && (
            <div className="border-t border-[var(--border-default)] pt-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Skills coverage</h3>
              <p className="text-xs text-[var(--text-muted)] mb-3">
                These JD keywords don&apos;t appear in your profile. Check the ones you have so the rewriter is allowed to mention them.
              </p>
              <div className="border border-[var(--border-default)] rounded-lg divide-y divide-[var(--border-default)] max-h-64 overflow-y-auto">
                {analysis.missing_keywords.map((kw) => (
                  <div key={kw} className="px-3 py-2 flex items-center justify-between gap-3">
                    <span className="text-sm text-[var(--text-primary)] truncate">{kw}</span>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-[var(--text-secondary)]">
                        <input type="checkbox" checked={!!haveKeyword[kw]} onChange={() => toggleHave(kw)}
                          disabled={stage === "generating"} className="accent-[var(--accent-primary)]" />
                        I have this
                      </label>
                      <label className={`flex items-center gap-1.5 select-none text-xs ${haveKeyword[kw] ? "cursor-pointer text-[var(--text-secondary)]" : "cursor-not-allowed text-[var(--text-muted)] opacity-50"}`}>
                        <input type="checkbox" checked={!!saveKeyword[kw]} onChange={() => toggleSave(kw)}
                          disabled={!haveKeyword[kw] || stage === "generating"} className="accent-[var(--accent-cyan)]" />
                        Save to Skills
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleGenerate} disabled={stage === "generating"}
              className="px-5 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2">
              {stage === "generating" ? (
                <><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />Generating…</>
              ) : (
                want === "both" ? "Generate both" : want === "cv" ? "Generate CV" : "Generate cover letter"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {stage === "done" && (cvResult || clResult) && (
        <div className="space-y-6">
          {cvResult && (
            <ArtifactCard
              kind="cv"
              title="CV"
              locale={locale}
              detectedLanguage={cvResult.detected_language}
              identifier={cvResult.cv_version_id}
              html={cvResult.html}
              warning={cvResult.warning ?? null}
              pdfUrl={cvPdfUrl}
              pdfLoading={cvPdfLoading}
              onDownload={downloadCvPdf}
            />
          )}
          {clResult && (
            <ArtifactCard
              kind="cover_letter"
              title="Cover Letter"
              locale={locale}
              detectedLanguage={clResult.detected_language}
              identifier={clResult.cover_letter_id}
              html={clResult.html}
              warning={null}
              pdfUrl={clPdfUrl}
              pdfLoading={clPdfLoading}
              onDownload={downloadCoverLetterPdf}
              body={clResult.body}
              copyStatus={copyStatus}
              onCopy={handleCopyCoverLetter}
            />
          )}

          {/* Follow-up banner */}
          {(cvResult && !clResult) || (!cvResult && clResult) ? (
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4 flex items-center justify-between gap-3">
              <div className="text-sm text-[var(--text-secondary)]">
                {cvResult && !clResult && "Need a cover letter for this JD too?"}
                {!cvResult && clResult && "Need a CV for this JD too?"}
              </div>
              <button
                onClick={cvResult && !clResult ? handleFollowupAddCoverLetter : handleFollowupAddCv}
                disabled={followupLoading}
                className="px-4 py-2 rounded-lg border border-[var(--accent-primary)] text-[var(--accent-primary)] text-sm font-semibold hover:bg-[var(--accent-primary)]/10 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {followupLoading && (
                  <span className="animate-spin inline-block w-3 h-3 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full" />
                )}
                {cvResult && !clResult ? "Add cover letter" : "Add CV"}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ─── Result card for a single artifact ────────────────────────────────

interface ArtifactCardProps {
  kind: "cv" | "cover_letter";
  title: string;
  locale: "en" | "es";
  detectedLanguage: string;
  identifier: string;
  html: string;
  warning: string | null;
  pdfUrl: string | null;
  pdfLoading: boolean;
  onDownload: () => void;
  body?: string; // cover letter only
  copyStatus?: "idle" | "copied";
  onCopy?: () => void;
}

const LANG_LABEL: Record<"en" | "es", string> = { en: "English", es: "Español" };

function ArtifactCard(p: ArtifactCardProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{p.title}</h2>
        <div className="text-xs text-[var(--text-muted)] flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-medium">
            Output: {LANG_LABEL[p.locale]}
          </span>
          <span>•</span>
          <span>Detected: {LANG_LABEL[p.detectedLanguage as "en" | "es"] ?? p.detectedLanguage}</span>
          <span>•</span>
          <code className="text-[var(--accent-cyan)]">{p.identifier.slice(0, 8)}</code>
        </div>
      </div>

      {p.warning && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-sm text-yellow-700 dark:text-yellow-400">
          <span className="font-semibold">Note: </span>{p.warning}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {p.pdfUrl ? (
          <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer"
            className="px-5 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            Download PDF
          </a>
        ) : (
          <button onClick={p.onDownload} disabled={p.pdfLoading}
            className="px-5 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2">
            {p.pdfLoading ? (
              <><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />Rendering PDF…</>
            ) : "Download PDF"}
          </button>
        )}
        {p.kind === "cover_letter" && p.onCopy && (
          <button onClick={p.onCopy}
            className="px-4 py-2 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.copyStatus === "copied" ? "✓ Copied" : "Copy text"}
          </button>
        )}
      </div>

      {/* Cover-letter copy-paste textarea */}
      {p.kind === "cover_letter" && p.body && (
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Plain text (for messages, email body, etc.)
          </label>
          <textarea
            readOnly
            rows={Math.min(14, Math.max(6, p.body.split("\n").length + 2))}
            value={p.body}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-mono"
          />
        </div>
      )}

      {/* HTML preview */}
      <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] overflow-hidden">
        <div className="px-4 py-2 border-b border-[var(--border-default)]">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            {p.title} preview
          </p>
        </div>
        <iframe
          srcDoc={p.html}
          title={`${p.title} preview`}
          className="w-full h-[600px] bg-white"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
