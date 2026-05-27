"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import {
  getNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/actions/notifications";
import type { ApiNotification } from "@/lib/adminApi";

export default function NotificationBell() {
  const router = useRouter();
  const t = useTranslations("adminCommon.notifications");
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return t("justNow");
    if (mins < 60) return t("mAgo", { mins });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t("hAgo", { hrs });
    return t("dAgo", { days: Math.floor(hrs / 24) });
  }

  async function refresh() {
    const res = await getNotificationsAction();
    setNotifications(res.data);
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function handleClickNotification(n: ApiNotification) {
    if (!n.read_at) {
      await markNotificationReadAction(n.id);
      setNotifications((prev) =>
        prev.map((x) =>
          x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x,
        ),
      );
    }
    if (n.job_id) {
      router.push(`/admin/jobs/${n.job_id}`);
      setOpen(false);
    }
  }

  async function handleMarkAllRead() {
    await markAllNotificationsReadAction();
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read_at: n.read_at ?? new Date().toISOString(),
      })),
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-(--text-secondary) hover:text-foreground hover:bg-(--bg-elevated) transition-colors"
        title={t("title")}
        aria-label={`${t("title")}${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center text-[10px] font-bold rounded-full bg-(--accent-violet) text-white leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-(--border-subtle) bg-(--bg-surface) shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-(--border-subtle)">
            <span className="text-sm font-semibold text-foreground">
              {t("title")}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-(--accent-cyan) hover:underline"
              >
                {t("markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-(--border-subtle)">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-(--text-secondary) text-center">
                {t("empty")}
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-(--bg-elevated) transition-colors ${
                    !n.read_at ? "bg-(--accent-violet)/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5 shrink-0">
                      {n.type === "high_match_job" ? "⭐" : "✓"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-(--text-secondary) mt-0.5">
                        {n.body}
                      </p>
                      <p className="text-xs text-(--text-secondary) mt-1 opacity-60">
                        {relativeTime(n.created_at)}
                      </p>
                    </div>
                    {!n.read_at && (
                      <span className="w-2 h-2 rounded-full bg-(--accent-violet) mt-1.5 shrink-0" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
