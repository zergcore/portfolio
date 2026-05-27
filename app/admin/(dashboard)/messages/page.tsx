import { getAdminContacts } from "@/lib/adminApi";
import Link from "next/link";
import { FiMail, FiCheckCircle, FiClock, FiChevronRight } from "react-icons/fi";
import { getTranslations } from "next-intl/server";

export const revalidate = 0;

export default async function AdminMessagesPage() {
  const messages = await getAdminContacts();
  const t = await getTranslations("adminMessages");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-(--text-primary)">
            {t("pageTitle")}
          </h1>
          <p className="text-(--text-secondary) mt-2">{t("pageDescription")}</p>
        </div>
        <div className="text-sm text-(--text-secondary)">
          {t("totalMessages", { count: messages.length })}
        </div>
      </div>

      <div className="bg-(--bg-surface) border border-(--border-subtle) rounded-xl overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-12 text-center">
            <FiMail className="w-12 h-12 text-(--text-muted) mx-auto mb-4" />
            <p className="text-(--text-secondary)">{t("table.empty")}</p>
          </div>
        ) : (
          <div className="divide-y divide-(--border-subtle)">
            {messages.map(
              (msg: {
                id: string;
                name: string;
                subject: string;
                message: string;
                is_read: boolean;
                created_at: string;
                replies: unknown[];
              }) => (
                <Link
                  key={msg.id}
                  href={`/admin/messages/${msg.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-(--bg-elevated) transition-colors group"
                >
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${msg.is_read ? "bg-transparent" : "bg-(--accent-violet)"}`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`font-semibold truncate ${msg.is_read ? "text-(--text-primary)" : "text-(--text-primary) font-bold"}`}
                      >
                        {msg.name}
                      </span>
                      <span className="text-xs text-(--text-muted) shrink-0">
                        • {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-(--text-secondary) truncate">
                        {msg.subject || t("table.noSubject")}
                      </span>
                      <span className="text-sm text-(--text-muted) truncate">
                        — {msg.message.substring(0, 100)}...
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {msg.replies && msg.replies.length > 0 ? (
                      <FiCheckCircle
                        className="text-(--color-success) w-5 h-5"
                        title={t("table.replied")}
                      />
                    ) : (
                      <FiClock
                        className="text-(--text-muted) w-5 h-5"
                        title={t("table.pending")}
                      />
                    )}
                    <FiChevronRight className="text-(--text-muted) group-hover:text-(--text-primary) transition-colors" />
                  </div>
                </Link>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
