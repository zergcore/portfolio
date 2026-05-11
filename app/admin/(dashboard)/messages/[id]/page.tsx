import { getAdminContact } from "@/lib/adminApi";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiCalendar,
  FiMessageSquare,
} from "react-icons/fi";
import ReplyForm from "@/components/admin/ReplyForm";

export const revalidate = 0;

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getAdminContact(id);

  if (!contact) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/admin/messages"
          className="flex items-center gap-2 text-(--text-secondary) hover:text-foreground transition-colors mb-4"
        >
          <FiArrowLeft /> Back to Inbox
        </Link>
        <h1 className="text-3xl font-bold text-foreground">
          {contact.subject || "No Subject"}
        </h1>
      </div>

      <div className="bg-(--bg-surface) border border-(--border-subtle) rounded-2xl p-8 shadow-xl shadow-black/5">
        <div className="flex flex-wrap gap-6 mb-8 text-sm border-b border-(--border-subtle) pb-6">
          <div className="flex items-center gap-2 text-(--text-secondary)">
            <FiUser className="text-(--accent-violet)" />
            <span className="font-semibold text-foreground">
              {contact.name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-(--text-secondary)">
            <FiMail className="text-(--accent-violet)" />
            <a
              href={`mailto:${contact.email}`}
              className="hover:text-(--accent-violet) transition-colors"
            >
              {contact.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-(--text-secondary)">
            <FiCalendar className="text-(--accent-violet)" />
            <span>{new Date(contact.created_at).toLocaleString()}</span>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-sm font-bold text-(--text-muted) uppercase tracking-wider mb-4 flex items-center gap-2">
            <FiMessageSquare /> Message
          </h3>
          <div className="text-foreground leading-relaxed whitespace-pre-wrap bg-(--bg-elevated) p-6 rounded-xl border border-(--border-subtle)">
            {contact.message}
          </div>
        </div>

        {contact.replies && contact.replies.length > 0 && (
          <div className="mb-10 space-y-6">
            <h3 className="text-sm font-bold text-(--text-muted) uppercase tracking-wider mb-4">
              Previous Replies
            </h3>
            {contact.replies.map(
              (reply: { id: string; created_at: string; message: string }) => (
                <div
                  key={reply.id}
                  className="bg-(--accent-violet)/5 border border-(--accent-violet)/20 p-6 rounded-xl"
                >
                  <div className="flex justify-between items-center mb-2 text-xs text-(--text-muted)">
                    <span className="font-semibold text-(--accent-violet)">
                      You replied
                    </span>
                    <span>{new Date(reply.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-foreground whitespace-pre-wrap">
                    {reply.message}
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        <ReplyForm contactId={contact.id} />
      </div>
    </div>
  );
}
