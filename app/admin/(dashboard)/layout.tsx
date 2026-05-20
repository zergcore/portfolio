import { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import NotificationBell from "@/components/admin/NotificationBell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden flex flex-col">
        <header className="flex items-center justify-end px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <NotificationBell />
        </header>
        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
