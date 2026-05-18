"use server";

import {
  analyzeJd,
  answerJdQuestions,
  confirmCvSkills,
  generateCoverLetter,
  generateCv,
  renderCoverLetterPdf,
  renderCvPdf,
  type CoverLetterRequest,
  type CoverLetterResponse,
  type CvAnalyzeRequest,
  type CvAnalyzeResponse,
  type CvConfirmSkillsResponse,
  type CvGenerateRequest,
  type CvGenerateResponse,
  type QaAnswerRequest,
  type QaAnswerResponse,
} from "@/lib/adminApi";

export async function answerJdQuestionsAction(
  payload: QaAnswerRequest
): Promise<QaAnswerResponse> {
  return answerJdQuestions(payload);
}

export async function generateCoverLetterAction(
  payload: CoverLetterRequest
): Promise<CoverLetterResponse> {
  return generateCoverLetter(payload);
}

export async function renderCoverLetterPdfAction(
  clId: string
): Promise<{ pdf_url: string }> {
  return renderCoverLetterPdf(clId);
}

export async function analyzeJdAction(payload: CvAnalyzeRequest): Promise<CvAnalyzeResponse> {
  return analyzeJd(payload);
}

export async function confirmCvSkillsAction(
  skills: string[]
): Promise<CvConfirmSkillsResponse> {
  return confirmCvSkills(skills);
}

export async function generateCvAction(payload: CvGenerateRequest): Promise<CvGenerateResponse> {
  return generateCv(payload);
}

export async function renderCvPdfAction(cvVersionId: string): Promise<{ pdf_url: string }> {
  return renderCvPdf(cvVersionId);
}
