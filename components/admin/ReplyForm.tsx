"use client";

import { useState } from "react";
import { replyToContactAction } from "@/app/actions/contact";
import { FiSend } from "react-icons/fi";

interface ReplyFormProps {
  contactId: string;
}

export default function ReplyForm({ contactId }: ReplyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setStatus(null);

    const result = await replyToContactAction(contactId, formData);

    if (result.success) {
      setStatus({ type: "success", message: result.message });
      (document.getElementById("reply-form") as HTMLFormElement).reset();
    } else {
      setStatus({ type: "error", message: result.message });
    }
    setIsSubmitting(false);
  }

  return (
    <div className="mt-8 pt-8 border-t border-[var(--border-subtle)]">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Reply to Message</h3>
      
      {status && (
        <div className={`p-4 rounded-lg mb-4 text-sm ${
          status.type === "success" 
            ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" 
            : "bg-[var(--color-error)]/10 text-[var(--color-error)]"
        }`}>
          {status.message}
        </div>
      )}

      <form id="reply-form" action={handleSubmit} className="space-y-4">
        <div>
          <textarea
            name="message"
            placeholder="Type your reply here..."
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 min-h-[150px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-violet)]/50 transition-all resize-none"
            required
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-[image:var(--gradient-brand)] text-white px-6 py-2.5 rounded-full font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-[var(--accent-violet)]/20"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              <>
                <FiSend className="w-4 h-4" />
                Send Reply
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
