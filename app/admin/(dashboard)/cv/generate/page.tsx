"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  analyzeJdAction,
  answerJdQuestionsAction,
  confirmCvSkillsAction,
  generateCoverLetterAction,
  generateCvAction,
  regenerateQaAnswerAction,
  renderCoverLetterPdfAction,
  renderCvPdfAction,
} from "@/app/actions/cv";
import type {
  CoverLetterResponse,
  CvAnalyzeResponse,
  CvGenerateResponse,
  QaAnswerResponse,
} from "@/lib/adminApi";
import { LOCALE_LABEL, MAX_QUESTIONS, STAGE_LABELS } from "@/lib/constants/cv";
import { ArtifactCheckbox } from "@/components/admin/cv/ArtifactCheckbox";
import { ModeCard } from "@/components/admin/cv/ModeCards";
import { ArtifactCard } from "@/components/admin/cv/ArtifactCard";
import { QaCard } from "@/components/admin/cv/QACard";

export type Stage =
  | "idle"
  | "analyzing"
  | "analyzed"
  | "generating"
  | "done"
  | "error";

export default function CvGeneratePage() {
  const t = useTranslations("adminCv");

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
  const [followupLoading, setFollowupLoading] = useState<
    null | "cv" | "cl" | "qa"
  >(null);
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
      const result = await analyzeJdAction({
        jd_text: jdText.trim() || undefined,
        jd_url: jdUrl.trim() || undefined,
      });
      if (result.error) throw new Error(result.error);
      const data = result.data!;
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
        ? Object.entries(haveKeyword)
            .filter(([, v]) => v)
            .map(([k]) => k)
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
      const { pdf_url } = await renderCoverLetterPdfAction(
        clResult.cover_letter_id,
      );
      setClPdfUrl(pdf_url);
      triggerDownload(pdf_url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Cover letter PDF render failed",
      );
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

  async function handleRegenerateQa(
    qIndex: number,
    hint: string,
  ): Promise<void> {
    if (!qaResult) return;
    try {
      const { pair } = await regenerateQaAnswerAction(qaResult.qa_session_id, {
        question_index: qIndex,
        hint: hint.trim() || undefined,
      });
      setQaResult({
        ...qaResult,
        answers: qaResult.answers.map((p, i) => (i === qIndex ? pair : p)),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Regeneration failed");
    }
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
          setError(
            "Add at least one question in the Q&A field above and try again.",
          );
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

  const sourceLocked = stage !== "idle" && stage !== "error";
  const optionsLocked =
    stage === "analyzing" || stage === "generating" || stage === "done";
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
    if (!clResult)
      missingArtifacts.push({ key: "cl", label: "Add cover letter" });
    if (!qaResult)
      missingArtifacts.push({ key: "qa", label: "Add Q&A answers" });
  }

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {t("pageTitle")}
        </h1>
        <p className="text-sm text-(--text-muted)">{t("pageDescription")}</p>
      </div>

      {/* Stage 1 */}
      <div className="bg-(--bg-elevated) rounded-xl border border-(--border-default) p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-1">
            {t("jobDescription")}
          </label>
          <textarea
            rows={8}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder={t("jobDescriptionPlaceholder")}
            disabled={sourceLocked}
            className="w-full bg-(--bg-input) border border-(--border-default) rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-primary) disabled:opacity-50 resize-y"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-(--text-muted)">
          <div className="h-px flex-1 bg-(--border-default)" />
          <span>{t("or")}</span>
          <div className="h-px flex-1 bg-(--border-default)" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-1">
            {t("jdUrl")}
          </label>
          <input
            type="url"
            value={jdUrl}
            onChange={(e) => setJdUrl(e.target.value)}
            placeholder={t("jdUrlPlaceholder")}
            disabled={sourceLocked}
            className="w-full bg-(--bg-input) border border-(--border-default) rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-primary) disabled:opacity-50"
          />
        </div>

        {/* What do you need? — checkboxes */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider">
            {t("whatDoYouNeed")}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <ArtifactCheckbox
              checked={wantCv}
              onChange={() => setWantCv((v) => !v)}
              disabled={optionsLocked}
              title="CV"
              hint="PDF tailored to this JD"
            />
            <ArtifactCheckbox
              checked={wantCl}
              onChange={() => setWantCl((v) => !v)}
              disabled={optionsLocked}
              title="Cover letter"
              hint="PDF + copy-paste text"
            />
            <ArtifactCheckbox
              checked={wantQa}
              onChange={() => setWantQa((v) => !v)}
              disabled={optionsLocked}
              title="Q&A answers"
              hint="Per-question copy-paste"
            />
          </div>
        </div>

        {wantQa && (
          <div>
            <label className="block text-xs font-semibold text-[--text-muted] uppercase tracking-wider mb-1">
              Application questions ({MAX_QUESTIONS} max, one per line)
            </label>
            <textarea
              rows={5}
              value={qaQuestionsText}
              onChange={(e) => setQaQuestionsText(e.target.value)}
              placeholder={`How many years of Python experience do you have?\nDescribe a time you led a team through a difficult migration.\nWhat are your salary expectations?`}
              disabled={optionsLocked}
              className="w-full bg-[--bg-input] border border-[--border-default] rounded-lg px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:ring-2 focus:ring-[--accent-primary] disabled:opacity-50 resize-y font-mono"
            />
            <p className="text-[10px] text-[--text-muted] mt-1">
              Personal questions (salary, visa, availability, etc.) will return
              a <code>[NEEDS_HUMAN_INPUT: …]</code> placeholder — fill those in
              by hand.
            </p>
          </div>
        )}

        {/* CV-specific options (grey when CV not selected) */}
        <div className={!wantCv ? "opacity-40 pointer-events-none" : ""}>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider">
              {t("cvFormat")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <ModeCard
                active={mode === "full"}
                onClick={() => setMode("full")}
                disabled={optionsLocked}
                title={t("fullCv")}
                hint={t("fullCvDesc")}
              />
              <ModeCard
                active={mode === "one_page"}
                onClick={() => setMode("one_page")}
                disabled={optionsLocked}
                title={t("onePageCv")}
                hint={t("onePageCvDesc")}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 items-end mt-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider">
                {t("bulletsPerRole")}{" "}
                {mode === "one_page" && (
                  <span className="normal-case">(capped at 2)</span>
                )}
              </label>
              <select
                value={bulletsPerRole}
                onChange={(e) => setBulletsPerRole(Number(e.target.value))}
                disabled={optionsLocked || mode === "one_page"}
                className="bg-[--bg-input] border border-[--border-default] rounded-lg px-3 py-2 text-sm text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--accent-primary] disabled:opacity-50"
              >
                {[2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={aiRewrite}
                onChange={(e) => setAiRewrite(e.target.checked)}
                disabled={optionsLocked}
                className="mt-1 accent-[--accent-primary] disabled:opacity-50"
              />
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-[--text-primary]">
                  AI-rewrite bullets for this JD
                </span>
                <span className="text-xs text-[--text-muted]">
                  Retrieves your top experiences via semantic search (RAG) and
                  re-ranks them using LLM-as-a-Judge. Checking this allows the
                  AI to tailor bullets using your confirmed keywords. Strict
                  no-fabrication rules apply.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {stage === "idle" || stage === "error" ? (
            <>
              <button
                onClick={handleAnalyze}
                disabled={
                  (!jdText.trim() && !jdUrl.trim()) || nothingSelected()
                }
                className="px-5 py-2 rounded-lg bg-(--accent-primary) text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {t("analyzeJd")}
              </button>
              <button
                onClick={handleLucky}
                disabled={
                  (!jdText.trim() && !jdUrl.trim()) || nothingSelected()
                }
                title="Detect language and generate selected artifacts in one click"
                className="px-5 py-2 rounded-lg border border-(--accent-primary) text-(--accent-primary) text-sm font-semibold hover:bg-(--accent-primary)/10 disabled:opacity-40 transition-colors"
              >
                {t("lucky")}
              </button>
            </>
          ) : (
            <button
              onClick={handleStartOver}
              disabled={busy}
              className="px-4 py-2 rounded-lg border border-(--border-default) text-sm text-[--text-muted] hover:text-[--text-primary] disabled:opacity-50 transition-colors"
            >
              Start over
            </button>
          )}
          {busy && (
            <span className="flex items-center gap-2 text-sm text-[--text-muted]">
              <span className="animate-spin inline-block w-3 h-3 border-2 border-[--accent-primary] border-t-transparent rounded-full" />
              {STAGE_LABELS[stage]}
            </span>
          )}
        </div>
      </div>

      {(stage === "error" || error) && error && error !== "SCRAPE_BLOCKED" && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {(stage === "error" || error) && error === "SCRAPE_BLOCKED" && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-4 text-sm text-yellow-800 dark:text-yellow-200">
          <p className="font-semibold mb-1 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            Unable to automatically read this job posting
          </p>
          <p>
            The site actively blocks automated scrapers. Please copy and paste
            the job description text into the text area above to continue.
          </p>
        </div>
      )}

      {/* Stage 2 */}
      {analysis && (stage === "analyzed" || stage === "generating") && (
        <div className="bg-[--bg-elevated] rounded-xl border border-[--accent-primary)]/40 p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-[--text-primary)] mb-1">
              Confirm output language
            </h2>
            <p className="text-xs text-[--text-muted)]">
              Detected:{" "}
              <span className="font-semibold text-foreground">
                {detectedLang ? LOCALE_LABEL[detectedLang] : "—"}
              </span>
              . Override below if needed.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["en", "es"] as const).map((lng) => (
              <button
                key={lng}
                type="button"
                onClick={() => setLocale(lng)}
                disabled={stage === "generating"}
                className={`px-4 py-3 rounded-lg border text-left transition-colors disabled:opacity-50 ${
                  locale === lng
                    ? "border-(--accent-primary) bg-(--accent-primary)/10 text-foreground"
                    : "border-(--border-default) bg-(--bg-input) text-(--text-muted) hover:text-foreground"
                }`}
              >
                <div className="text-sm font-semibold flex items-center gap-2">
                  {LOCALE_LABEL[lng]}
                  {lng === detectedLang && (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-(--accent-primary)">
                      detected
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {jdStructured?.must_have_skills &&
            jdStructured.must_have_skills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-2">
                  JD signals
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(jdStructured.must_have_skills ?? []).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-full bg-(--accent-primary)/10 text-(--accent-primary) text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                  {(jdStructured.nice_to_have_skills ?? []).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-full bg-(--border-default) text-(--text-muted) text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {wantCv && analysis.missing_keywords.length > 0 && (
            <div className="border-t border-(--border-default) pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Skills coverage
              </h3>
              <p className="text-xs text-(--text-muted) mb-3">
                These JD keywords don&apos;t appear in your profile. Check the
                ones you have to include them in the CV, or star them to save
                them to your profile permanently.
              </p>
              <div className="flex flex-wrap gap-3 max-h-72 overflow-y-auto pr-2 pb-2">
                {analysis.missing_keywords.map((kw) => {
                  const hasIt = !!haveKeyword[kw];
                  const saveIt = !!saveKeyword[kw];
                  return (
                    <div
                      key={kw}
                      className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-300 ${
                        hasIt
                          ? "border-(--accent-primary) bg-(--accent-primary)/10 shadow-sm"
                          : "border-(--border-default) bg-(--bg-surface) hover:border-(--border-strong) hover:bg-(--bg-elevated)"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleHave(kw)}
                        disabled={stage === "generating"}
                        className="flex items-center justify-between gap-3 px-3 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-(--accent-primary)"
                      >
                        <span
                          className={`text-sm font-medium transition-colors ${hasIt ? "text-(--accent-primary)" : "text-(--text-secondary) group-hover:text-foreground"}`}
                        >
                          {kw}
                        </span>
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${hasIt ? "border-(--accent-primary) bg-(--accent-primary)" : "border-(--border-strong)"}`}
                        >
                          {hasIt && (
                            <svg
                              className="h-3 w-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </button>

                      <div
                        className={`grid transition-all duration-300 ease-in-out ${hasIt ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                      >
                        <div className="overflow-hidden">
                          <div className="border-t border-(--accent-primary)/20 bg-(--accent-primary)/5 px-3 py-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none group/save">
                              <input
                                type="checkbox"
                                checked={saveIt}
                                onChange={() => toggleSave(kw)}
                                disabled={stage === "generating"}
                                className="sr-only"
                              />
                              <div
                                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${saveIt ? "border-(--accent-cyan) bg-(--accent-cyan)" : "border-(--accent-primary)/40 group-hover/save:border-(--accent-primary)"}`}
                              >
                                {saveIt && (
                                  <svg
                                    className="h-2.5 w-2.5 text-background"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span
                                className={`text-xs font-medium transition-colors ${saveIt ? "text-(--accent-cyan)" : "text-(--accent-primary)/80 hover:text-(--accent-primary)"}`}
                              >
                                Save to Profile
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleGenerate}
              disabled={stage === "generating"}
              className="px-5 py-2 rounded-lg bg-(--accent-primary) text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
            >
              {stage === "generating" ? (
                <>
                  <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                  Generating…
                </>
              ) : cvOnly ? (
                "Generate CV"
              ) : (
                "Generate"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {stage === "done" && (cvResult || clResult || qaResult) && (
        <div className="space-y-6">
          {cvResult && (
            <div className="space-y-6">
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
              {cvResult.scoring_audit && cvResult.scoring_audit.length > 0 && (
                <div className="bg-white/50 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    Semantic Match Variance
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg w-24">
                            Score
                          </th>
                          <th className="px-4 py-3 w-48">Role</th>
                          <th className="px-4 py-3 rounded-tr-lg">Bullet</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {cvResult.scoring_audit.map((item, i) => (
                          <tr
                            key={i}
                            className="hover:bg-white/50 transition-colors"
                          >
                            <td className="px-4 py-3 font-mono font-medium whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-md ${
                                  item.score >= 0.88
                                    ? "bg-green-100 text-green-700"
                                    : item.score >= 0.8
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {item.score.toFixed(3)}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-700">
                              {item.role}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {item.bullet}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
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
              copied={!!copyStatus["cl_body"]}
              onCopy={() => copyToClipboard("cl_body", clResult.body)}
            />
          )}
          {qaResult && (
            <QaCard
              session={qaResult}
              locale={locale}
              copyStatus={copyStatus}
              onCopy={(idx, text) => copyToClipboard(`qa_${idx}`, text)}
              onRegenerate={handleRegenerateQa}
            />
          )}

          {missingArtifacts.length > 0 && (
            <div className="rounded-xl border border-(--border-default) bg-(--bg-elevated) p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm text-(--text-secondary)">
                Need anything else for this JD?
              </div>
              <div className="flex flex-wrap gap-2">
                {missingArtifacts.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => followup(m.key)}
                    disabled={followupLoading !== null}
                    className="px-4 py-2 rounded-lg border border-(--accent-primary) text-(--accent-primary) text-sm font-semibold hover:bg-(--accent-primary)/10 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {followupLoading === m.key && (
                      <span className="animate-spin inline-block w-3 h-3 border-2 border-(--accent-primary) border-t-transparent rounded-full" />
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
