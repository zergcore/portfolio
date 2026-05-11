import { getAdminContacts } from "@/lib/adminApi";
import Link from "next/link";
import { FiMail, FiCheckCircle, FiClock, FiChevronRight } from "react-icons/fi";

export const revalidate = 0;

export default async function AdminMessagesPage() {
  const messages = await getAdminContacts();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Contact Inbox
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Review and reply to messages from your portfolio.
          </p>
        </div>
        <div className="text-sm text-[var(--text-secondary)]">
          Total: {messages.length} messages
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-12 text-center">
            <FiMail className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <p className="text-[var(--text-secondary)]">Your inbox is empty.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {messages.map((msg: { id: string, name: string, subject: string, message: string, is_read: boolean, created_at: string, replies: unknown[] }) => (
              <Link
                key={msg.id}
                href={`/admin/messages/${msg.id}`}
                className="flex items-center gap-4 p-4 hover:bg-[var(--bg-elevated)] transition-colors group"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${msg.is_read ? 'bg-transparent' : 'bg-[var(--accent-violet)]'}`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold truncate ${msg.is_read ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)] font-bold'}`}>
                      {msg.name}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                      • {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text-secondary)] truncate">
                      {msg.subject || "(No Subject)"}
                    </span>
                    <span className="text-sm text-[var(--text-muted)] truncate">— {msg.message.substring(0, 100)}...</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {msg.replies && msg.replies.length > 0 ? (
                    <FiCheckCircle className="text-[var(--color-success)] w-5 h-5" title="Replied" />
                  ) : (
                    <FiClock className="text-[var(--text-muted)] w-5 h-5" title="Pending" />
                  )}
                  <FiChevronRight className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
