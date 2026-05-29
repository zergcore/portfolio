"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Send, CheckCircle, AlertTriangle } from "lucide-react";

type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

import { submitContactAction } from "@/app/actions/contact";

async function submitContact(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
    honey: formData.get("_honey") as string,
  };

  const res = await submitContactAction(data);

  if (res.success) {
    return { status: "success" };
  } else {
    return { status: "error", message: res.message };
  }
}

export default function ContactForm() {
  const t = useTranslations("contact.form");
  const [state, formAction, isPending] = useActionState(submitContact, {
    status: "idle" as const,
  });

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-(--bg-elevated) rounded-xl border border-(--accent-cyan)/30">
        <CheckCircle size={48} className="text-(--accent-cyan) mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">
          {t("successTitle")}
        </h3>
        <p className="text-(--text-secondary) max-w-md">{t("successDesc")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Honeypot — visually hidden */}
      <input
        type="text"
        name="_honey"
        className="absolute opacity-0 h-0 w-0 pointer-events-none"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="contact-name"
            className="text-sm font-medium text-(--text-secondary)"
          >
            {t("name")}
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            placeholder={t("namePlaceholder")}
            className="px-4 py-3 rounded-lg bg-(--bg-surface) border border-(--border-default) text-foreground placeholder:text-(--text-muted) focus:outline-none focus:border-(--accent-cyan) focus:ring-1 focus:ring-(--accent-cyan)/30 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="contact-email"
            className="text-sm font-medium text-(--text-secondary)"
          >
            {t("email")}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder={t("emailPlaceholder")}
            className="px-4 py-3 rounded-lg bg-(--bg-surface) border border-(--border-default) text-foreground placeholder:text-(--text-muted) focus:outline-none focus:border-(--accent-cyan) focus:ring-1 focus:ring-(--accent-cyan)/30 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="contact-subject"
          className="text-sm font-medium text-(--text-secondary)"
        >
          {t("subject")}
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          placeholder={t("subjectPlaceholder")}
          className="px-4 py-3 rounded-lg bg-(--bg-surface) border border-(--border-default) text-foreground placeholder:text-(--text-muted) focus:outline-none focus:border-(--accent-cyan) focus:ring-1 focus:ring-(--accent-cyan)/30 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="contact-message"
          className="text-sm font-medium text-(--text-secondary)"
        >
          {t("message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder={t("messagePlaceholder")}
          className="px-4 py-3 rounded-lg bg-(--bg-surface) border border-(--border-default) text-foreground placeholder:text-(--text-muted) focus:outline-none focus:border-(--accent-cyan) focus:ring-1 focus:ring-(--accent-cyan)/30 transition-colors resize-none"
        />
      </div>

      {state.status === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertTriangle size={16} />
          {state.message || t("errorGeneric")}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-(image:--gradient-brand) text-white font-semibold text-sm transition-all duration-300 hover:opacity-90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed self-start"
      >
        {isPending ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t("sending")}
          </>
        ) : (
          <>
            <Send size={16} />
            {t("submit")}
          </>
        )}
      </button>
    </form>
  );
}
