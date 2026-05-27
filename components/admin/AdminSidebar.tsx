"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FiChevronDown, FiLogOut } from "react-icons/fi";
import { logoutAction } from "@/app/actions/auth";
import { adminNavItems } from "@/lib/constants/adminNav";
import type { NavEntry, NavGroup, NavItem } from "@/lib/types/admin";
import AdminLocaleSwitcher from "@/components/admin/AdminLocaleSwitcher";

function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

function isActive(href: string, pathname: string) {
  return (
    pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"))
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("adminSidebar");

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const entry of adminNavItems) {
      if (
        isGroup(entry) &&
        entry.items.some((sub) => isActive(sub.href, pathname ?? ""))
      ) {
        initial.add(entry.labelKey);
      }
    }
    return initial;
  });

  useEffect(() => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      for (const entry of adminNavItems) {
        if (
          isGroup(entry) &&
          entry.items.some((sub) => isActive(sub.href, pathname))
        ) {
          next.add(entry.labelKey);
        }
      }
      return next;
    });
  }, [pathname]);

  const toggleGroup = (labelKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(labelKey)) {
        next.delete(labelKey);
      } else {
        next.add(labelKey);
      }
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
        {t(`nav.${item.labelKey}`)}
      </Link>
    );
  };

  const renderGroup = (group: NavGroup) => {
    const groupActive = group.items.some((sub) => isActive(sub.href, pathname));
    const expanded = expandedGroups.has(group.labelKey);

    return (
      <div key={group.labelKey}>
        <button
          onClick={() => toggleGroup(group.labelKey)}
          className={linkClass(groupActive) + " w-full"}
        >
          <group.icon className="w-5 h-5" />
          {t(`nav.${group.labelKey}`)}
          <FiChevronDown
            className={`ml-auto w-4 h-4 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {expanded && (
          <div className="mt-1 ml-4 pl-3 border-l border-(--border-subtle) space-y-0.5">
            {group.items.map((sub) => {
              const active = isActive(sub.href, pathname);
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "text-(--accent-violet)"
                      : "text-(--text-secondary) hover:text-foreground hover:bg-(--bg-elevated)"
                  }`}
                >
                  <sub.icon className="w-4 h-4" />
                  {t(`nav.${sub.labelKey}`)}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col bg-(--bg-surface)">
      <div className="p-6 border-b border-(--border-subtle) flex items-center justify-between">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-(image:--gradient-brand)">
          {t("title")}
        </h2>
        <AdminLocaleSwitcher />
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {adminNavItems.map((entry) =>
          isGroup(entry) ? renderGroup(entry) : renderItem(entry),
        )}
      </nav>

      <div className="p-4 border-t border-(--border-subtle)">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-(--text-secondary) hover:text-(--color-error) hover:bg-(--color-error)/10 transition-colors"
        >
          <FiLogOut className="w-5 h-5" />
          {t("signOut")}
        </button>
      </div>
    </div>
  );
}
