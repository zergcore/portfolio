"use client";

import { useState } from "react";
import {
  analyzeJdAction,
  answerJdQuestionsAction,
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
  QaAnswerResponse,
} from "@/lib/adminApi";

type Stage = "idle" | "analyzing" | "analyzed" | "generating" | "done" | "error";

const STAGE_LABELS: Record<Stage, string> = {
  idle: "",
  analyzing: "Analyzing JD…",
  analyzed: "Confirm and generate",
  generating: "Generating…",
  done: "Done",
  error: "",
};

const LOCALE_LABEL: Record<"en" | "es", string> = { en: "English", es: "Español" };

const MAX_QUESTIONS = 10;

export default function CvGeneratePage() {
  // Stage 1 inputs
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [bulletsPerRole, setBulletsPerRole] = useState(3);
  const [mode, setMode] = useState<"full" | "one_page">("full");
  const [aiRewrite, setAiRewrite] = useState(false);

  // Artifact toggles (checkboxes — any combination)
  const [wantCv, setWantCv] = useState(true);
  const [wantCl, setWantCl] = useState(false);
  const [wantQa, setWantQa] = useState(false);
  const [qaQuestionsText, setQaQuestionsText] = useState("");

  // Stage 2 inputs
  const [locale, setLocale] = useState<"en" | "es">("en");
  const [haveKeyword, setHaveKeyword] = useState<Record<string, boolean>>({});
  const [saveKeyword, setSaveKeyword] = useState<Record<string, boolean>>({});

  // State machine
  const [stage, setStage] = useState<Stage>("idle");
  const [analysis, setAnalysis] = useState<CvAnalyzeResponse | null>(null);
  const [cvResult, setCvResult] = useState<CvGenerateResponse | null>(null);
  const [clResult, setClResult] = useState<CoverLetterResponse | null>(null);
  const [qaResult, setQaResult] = useState<QaAnswerResponse | null>(null);
  const [cvPdfUrl, setCvPdfUrl] = useState<string | null>(null);
  const [clPdfUrl, setClPdfUrl] = useState<string | null>(null);
  const [cvPdfLoading, setCvPdfLoading] = useState(false);
  const [clPdfLoading, setClPdfLoading] = useState(false);
  const [followupLoading, setFollowupLoading] = useState<null | "cv" | "cl" | "qa">(null);
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  function parseQuestions(text: string): string[] {
    return text
      .split("\n")
      .map((q) => q.trim())
      .filter(Boolean)
      .slice(0, MAX_QUESTIONS);
  }

  function resetResults() {
    setCvResult(null);
    setClResult(null);
    setQaResult(null);
    setCvPdfUrl(null);
    setClPdfUrl(null);
    setCopyStatus({});
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

  function nothingSelected(): boolean {
    return !wantCv && !wantCl && !wantQa;
  }

  async function handleAnalyze() {
    if (!jdText.trim() && !jdUrl.trim()) return;
    if (nothingSelected()) {
      setError("Pick at least one artifact (CV / Cover letter / Q&A).");
      return;
    }
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
    cv: boolean;
    cl: boolean;
    qa: boolean;
  }) {
    if (opts.cv) {
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
    if (opts.cl) {
      const data = await generateCoverLetterAction({
        jd_text: opts.jdText,
        locale: opts.chosenLocale,
        confirmed_keywords: opts.confirmedKeywords,
      });
      setClResult(data);
    }
    if (opts.qa) {
      const questions = parseQuestions(qaQuestionsText);
      if (questions.length > 0) {
        const data = await answerJdQuestionsAction({
          jd_text: opts.jdText,
          locale: opts.chosenLocale,
          questions,
          confirmed_keywords: opts.confirmedKeywords,
        });
        setQaResult(data);
      }
    }
  }

  async function handleGenerate() {
    if (!analysis) return;
    if (wantQa && parseQuestions(qaQuestionsText).length === 0) {
      setError("Q&A is selected but no questions were entered.");
      return;
    }
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
        cv: wantCv,
        cl: wantCl,
        qa: wantQa,
      });
      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStage("error");
    }
  }

  async function handleLucky() {
    if (!jdText.trim() && !jdUrl.trim()) return;
    if (nothingSelected()) {
      setError("Pick at least one artifact.");
      return;
    }
    if (wantQa && parseQuestions(qaQuestionsText).length === 0) {
      setError("Q&A is selected but no questions were entered.");
      return;
    }
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
        cv: wantCv,
        cl: wantCl,
        qa: wantQa,
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

  async function copyToClipboard(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus((m) => ({ ...m, [key]: true }));
      setTimeout(() => setCopyStatus((m) => ({ ...m, [key]: false })), 1500);
    } catch {
      // user can fall back to manual selection
    }
  }

  // Follow-up: add a missing artifact using cached analysis
  async function followup(kind: "cv" | "cl" | "qa") {
    if (!analysis) return;
    setFollowupLoading(kind);
    setError(null);
    try {
      if (kind === "cv") {
        const data = await generateCvAction({
          jd_text: analysis.jd_text,
          locale,
          bullets_per_role: bulletsPerRole,
          mode,
          ai_rewrite: aiRewrite,
          confirmed_keywords: [],
        });
        setCvResult(data);
      } else if (kind === "cl") {
        const data = await generateCoverLetterAction({
          jd_text: analysis.jd_text,
          locale,
          confirmed_keywords: [],
        });
        setClResult(data);
      } else {
        const questions = parseQuestions(qaQuestionsText);
        if (questions.length === 0) {
          setError("Add at least one question in the Q&A field above and try again.");
          return;
        }
        const data = await answerJdQuestionsAction({
          jd_text: analysis.jd_text,
          locale,
          questions,
          confirmed_keywords: [],
        });
        setQaResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setFollowupLoading(null);
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
  const jdStructured = (analysis?.jd_structured ??
    cvResult?.jd_structured ??
    clResult?.jd_structured ??
    qaResult?.jd_structured) as Record<string, string[]> | undefined;

  const cvOnly = wantCv && !wantCl && !wantQa;
  const missingArtifacts: { key: "cv" | "cl" | "qa"; label: string }[] = [];
  if (stage === "done") {
    if (!cvResult) missingArtifacts.push({ key: "cv", label: "Add CV" });
    if (!clResult) missingArtifacts.push({ key: "cl", label: "Add cover letter" });
    if (!qaResult) missingArtifacts.push({ key: "qa", label: "Add Q&A answers" });
  }

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">CV, Cover Letter & Q&A</h1>
        <p className="text-sm text-[var(--text-muted)]">
          One JD in, any combination of artifacts out. Each is distinct: CV and cover letter download as PDFs, Q&A is copy-paste prose per question.
        </p>
      </div>

      {/* Stage 1 */}
      <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Job Description
          </label>
          <textarea rows={8} value={jdText} onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the job description here…" disabled={inputsLocked}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] disabled:opacity-50 resize-y" />
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <div className="h-px flex-1 bg-[var(--border-default)]" /><span>or</span><div className="h-px flex-1 bg-[var(--border-default)]" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            JD URL
          </label>
          <input type="url" value={jdUrl} onChange={(e) => setJdUrl(e.target.value)}
            placeholder="https://boards.greenhouse.io/…" disabled={inputsLocked}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] disabled:opacity-50" />
        </div>

        {/* What do you need? — checkboxes */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            What do you need? (pick any combination)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <ArtifactCheckbox
              checked={wantCv} onChange={() => setWantCv((v) => !v)} disabled={inputsLocked}
              title="CV" hint="PDF tailored to this JD" />
            <ArtifactCheckbox
              checked={wantCl} onChange={() => setWantCl((v) => !v)} disabled={inputsLocked}
              title="Cover letter" hint="PDF + copy-paste text" />
            <ArtifactCheckbox
              checked={wantQa} onChange={() => setWantQa((v) => !v)} disabled={inputsLocked}
              title="Q&A answers" hint="Per-question copy-paste" />
          </div>
        </div>

        {wantQa && (
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Application questions ({MAX_QUESTIONS} max, one per line)
            </label>
            <textarea
              rows={5}
              value={qaQuestionsText}
              onChange={(e) => setQaQuestionsText(e.target.value)}
              placeholder={`How many years of Python experience do you have?\nDescribe a time you led a team through a difficult migration.\nWhat are your salary expectations?`}
              disabled={inputsLocked}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] disabled:opacity-50 resize-y font-mono"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              Personal questions (salary, visa, availability, etc.) will return a <code>[NEEDS_HUMAN_INPUT: …]</code> placeholder — fill those in by hand.
            </p>
          </div>
        )}

        {/* CV-specific options (grey when CV not selected) */}
        <div className={!wantCv ? "opacity-40 pointer-events-none" : ""}>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">CV Format</label>
            <div className="grid grid-cols-2 gap-2">
              <ModeCard active={mode === "full"} onClick={() => setMode("full")} disabled={inputsLocked}
                title="Full CV" hint="All experiences, JD-relevant bullets per role" />
              <ModeCard active={mode === "one_page"} onClick={() => setMode("one_page")} disabled={inputsLocked}
                title="1-Page CV" hint="Top experiences for this JD, 2 bullets each" />
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
                <span className="text-xs text-[var(--text-muted)]">One LLM call per selected bullet. Strict no-fabrication rules.</span>
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {stage === "idle" || stage === "error" ? (
            <>
              <button onClick={handleAnalyze}
                disabled={(!jdText.trim() && !jdUrl.trim()) || nothingSelected()}
                className="px-5 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity">
                Analyze JD
              </button>
              <button onClick={handleLucky}
                disabled={(!jdText.trim() && !jdUrl.trim()) || nothingSelected()}
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

      {(stage === "error" || error) && error && (
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
              Detected:{" "}
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

          {aiRewrite && wantCv && analysis.missing_keywords.length > 0 && (
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
                cvOnly ? "Generate CV" : "Generate"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {stage === "done" && (cvResult || clResult || qaResult) && (
        <div className="space-y-6">
          {cvResult && (
            <ArtifactCard kind="cv" title="CV" locale={locale}
              detectedLanguage={cvResult.detected_language} identifier={cvResult.cv_version_id}
              html={cvResult.html} warning={cvResult.warning ?? null}
              pdfUrl={cvPdfUrl} pdfLoading={cvPdfLoading} onDownload={downloadCvPdf} />
          )}
          {clResult && (
            <ArtifactCard kind="cover_letter" title="Cover Letter" locale={locale}
              detectedLanguage={clResult.detected_language} identifier={clResult.cover_letter_id}
              html={clResult.html} warning={null}
              pdfUrl={clPdfUrl} pdfLoading={clPdfLoading} onDownload={downloadCoverLetterPdf}
              body={clResult.body}
              copied={!!copyStatus["cl_body"]}
              onCopy={() => copyToClipboard("cl_body", clResult.body)} />
          )}
          {qaResult && (
            <QaCard
              session={qaResult}
              locale={locale}
              copyStatus={copyStatus}
              onCopy={(idx, text) => copyToClipboard(`qa_${idx}`, text)}
            />
          )}

          {missingArtifacts.length > 0 && (
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm text-[var(--text-secondary)]">
                Need anything else for this JD?
              </div>
              <div className="flex flex-wrap gap-2">
                {missingArtifacts.map((m) => (
                  <button key={m.key} onClick={() => followup(m.key)} disabled={followupLoading !== null}
                    className="px-4 py-2 rounded-lg border border-[var(--accent-primary)] text-[var(--accent-primary)] text-sm font-semibold hover:bg-[var(--accent-primary)]/10 disabled:opacity-50 transition-colors flex items-center gap-2">
                    {followupLoading === m.key && (
                      <span className="animate-spin inline-block w-3 h-3 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full" />
                    )}
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function ArtifactCheckbox(p: {
  checked: boolean; onChange: () => void; disabled: boolean; title: string; hint: string;
}) {
  return (
    <label className={`px-3 py-2.5 rounded-lg border text-left transition-colors flex items-start gap-2 cursor-pointer select-none ${
      p.checked
        ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)]"
        : "border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
    } ${p.disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <input type="checkbox" checked={p.checked} onChange={p.onChange} disabled={p.disabled}
        className="mt-1 accent-[var(--accent-primary)]" />
      <span className="flex flex-col">
        <span className="text-sm font-semibold">{p.title}</span>
        <span className="text-xs mt-0.5 opacity-75">{p.hint}</span>
      </span>
    </label>
  );
}

function ModeCard(p: {
  active: boolean; onClick: () => void; disabled: boolean; title: string; hint: string;
}) {
  return (
    <button type="button" onClick={p.onClick} disabled={p.disabled}
      className={`px-4 py-3 rounded-lg border text-left transition-colors disabled:opacity-50 ${
        p.active
          ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)]"
          : "border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      }`}>
      <div className="text-sm font-semibold">{p.title}</div>
      <div className="text-xs mt-0.5 opacity-75">{p.hint}</div>
    </button>
  );
}

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
  body?: string;
  copied?: boolean;
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
            {p.copied ? "✓ Copied" : "Copy text"}
          </button>
        )}
      </div>
      {p.kind === "cover_letter" && p.body && (
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Plain text (for messages, email body, etc.)
          </label>
          <textarea readOnly rows={Math.min(14, Math.max(6, p.body.split("\n").length + 2))}
            value={p.body} onFocus={(e) => e.currentTarget.select()}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-mono" />
        </div>
      )}
      <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] overflow-hidden">
        <div className="px-4 py-2 border-b border-[var(--border-default)]">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{p.title} preview</p>
        </div>
        <iframe srcDoc={p.html} title={`${p.title} preview`} className="w-full h-[600px] bg-white" sandbox="allow-same-origin" />
      </div>
    </div>
  );
}

function QaCard(p: {
  session: QaAnswerResponse;
  locale: "en" | "es";
  copyStatus: Record<string, boolean>;
  onCopy: (idx: number, text: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Application Q&amp;A</h2>
        <div className="text-xs text-[var(--text-muted)] flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-medium">
            Output: {LANG_LABEL[p.locale]}
          </span>
          <span>•</span>
          <span>Detected: {LANG_LABEL[p.session.detected_language as "en" | "es"] ?? p.session.detected_language}</span>
          <span>•</span>
          <code className="text-[var(--accent-cyan)]">{p.session.qa_session_id.slice(0, 8)}</code>
        </div>
      </div>

      <div className="space-y-3">
        {p.session.answers.map((pair, i) => {
          const isPlaceholder = pair.answer.includes("NEEDS_HUMAN_INPUT");
          return (
            <div key={i} className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  <span className="text-[var(--accent-primary)] mr-1.5">Q{i + 1}.</span>{pair.question}
                </div>
                <button onClick={() => p.onCopy(i, pair.answer)}
                  className="flex-shrink-0 px-3 py-1 rounded border border-[var(--border-default)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  {p.copyStatus[`qa_${i}`] ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <textarea
                readOnly
                rows={Math.min(10, Math.max(3, Math.ceil(pair.answer.length / 80)))}
                value={pair.answer}
                onFocus={(e) => e.currentTarget.select()}
                className={`w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm font-mono ${
                  isPlaceholder ? "text-amber-700 dark:text-amber-400 italic" : "text-[var(--text-primary)]"
                }`}
              />
              {isPlaceholder && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400">
                  This answer requires information not derivable from your profile. Fill it in yourself before submitting.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
