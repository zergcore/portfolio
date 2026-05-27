import { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import NotificationBell from "@/components/admin/NotificationBell";
import MobileDrawer from "@/components/admin/MobileDrawer";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[var(--bg-base)]">

      {/* Desktop Sidebar 
        (Hidden on mobile. You will need to implement a Drawer component 
        in AdminSidebar for mobile overlay behavior) 
      */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] md:flex">
        <AdminSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Fixed Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 md:justify-end md:px-6">

          {/* Mobile Menu Toggle + Drawer */}
          <MobileDrawer />

          <div className="flex items-center gap-4">
            {/* The Escape Hatch */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-md text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-cyan)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] sm:flex"
            >
              <ExternalLink size={16} aria-hidden="true" />
              View Live Site
            </Link>

            <div className="hidden h-6 w-px bg-[var(--border-subtle)] sm:block" aria-hidden="true" />

            <NotificationBell />
          </div>
        </header>

        {/* Independent Scroll Zone for Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}