"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";
import { logoutAction } from "@/app/actions/auth";
import { adminNavItems } from "@/lib/constants/adminNav";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/admin/login");
  };

  return (
    <div className="w-64 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] h-screen sticky top-0 hidden md:flex flex-col">
      <div className="p-6 border-b border-[var(--border-subtle)]">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-[image:var(--gradient-brand)]">
          Zergcore CMS
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {adminNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--accent-violet)]/10 text-[var(--accent-violet)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
        >
          <FiLogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
