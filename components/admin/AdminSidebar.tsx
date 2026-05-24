"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiChevronDown, FiLogOut } from "react-icons/fi";
import { logoutAction } from "@/app/actions/auth";
import { adminNavItems } from "@/lib/constants/adminNav";
import type { NavEntry, NavGroup, NavItem } from "@/lib/types/admin";

function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

function isActive(href: string, pathname: string) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"));
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const entry of adminNavItems) {
      if (isGroup(entry) && entry.items.some((sub) => isActive(sub.href, pathname ?? ""))) {
        initial.add(entry.label);
      }
    }
    return initial;
  });

  useEffect(() => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      for (const entry of adminNavItems) {
        if (isGroup(entry) && entry.items.some((sub) => isActive(sub.href, pathname))) {
          next.add(entry.label);
        }
      }
      return next;
    });
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) { next.delete(label); } else { next.add(label); }
      return next;
    });
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push("/admin/login");
  };

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active
        ? "bg-[var(--accent-violet)]/10 text-[var(--accent-violet)]"
        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
    }`;

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href, pathname);
    return (
      <Link key={item.href} href={item.href} className={linkClass(active)}>
        <item.icon className="w-5 h-5" />
        {item.label}
      </Link>
    );
  };

  const renderGroup = (group: NavGroup) => {
    const groupActive = group.items.some((sub) => isActive(sub.href, pathname));
    const expanded = expandedGroups.has(group.label);

    return (
      <div key={group.label}>
        <button
          onClick={() => toggleGroup(group.label)}
          className={linkClass(groupActive) + " w-full"}
        >
          <group.icon className="w-5 h-5" />
          {group.label}
          <FiChevronDown
            className={`ml-auto w-4 h-4 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {expanded && (
          <div className="mt-1 ml-4 pl-3 border-l border-[var(--border-subtle)] space-y-0.5">
            {group.items.map((sub) => {
              const active = isActive(sub.href, pathname);
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "text-[var(--accent-violet)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  <sub.icon className="w-4 h-4" />
                  {sub.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] h-screen sticky top-0 hidden md:flex flex-col">
      <div className="p-6 border-b border-[var(--border-subtle)]">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-[image:var(--gradient-brand)]">
          Zergcore CMS
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {adminNavItems.map((entry) =>
          isGroup(entry) ? renderGroup(entry) : renderItem(entry)
        )}
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
