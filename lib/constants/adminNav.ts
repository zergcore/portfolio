import {
  FiActivity,
  FiAward,
  FiBriefcase,
  FiCompass,
  FiCpu,
  FiEdit3,
  FiFileText,
  FiGlobe,
  FiHome,
  FiLayout,
  FiList,
  FiMail,
  FiSettings,
  FiSliders,
  FiUploadCloud,
  FiUser,
  FiZap,
} from "react-icons/fi";
import type { NavEntry } from "@/lib/types/admin";

export type { NavItem, NavGroup, NavEntry } from "@/lib/types/admin";

export const adminNavItems: NavEntry[] = [
  { href: "/admin",            labelKey: "dashboard",       icon: FiHome },
  { href: "/admin/profile",    labelKey: "profile",         icon: FiUser },
  { href: "/admin/projects",   labelKey: "projects",        icon: FiLayout },
  { href: "/admin/experience", labelKey: "experience",      icon: FiBriefcase },
  { href: "/admin/skills",     labelKey: "skills",          icon: FiList },
  { href: "/admin/education",  labelKey: "education",       icon: FiAward },
  { href: "/admin/blog",       labelKey: "blog",            icon: FiEdit3 },
  { href: "/admin/messages",   labelKey: "inbox",           icon: FiMail },
  { href: "/admin/translations", labelKey: "translations",  icon: FiGlobe },
  { href: "/admin/imports/linkedin", labelKey: "linkedinImport", icon: FiUploadCloud },
  { href: "/admin/cv/generate", labelKey: "cv",             icon: FiFileText },
  { href: "/admin/jobs",        labelKey: "jobs",           icon: FiCompass },
  { href: "/admin/preferences", labelKey: "preferences",    icon: FiSettings },
  { href: "/admin/setup",       labelKey: "setupStatus",    icon: FiActivity },
  {
    labelKey: "ai",
    icon: FiCpu,
    items: [
      { href: "/admin/ai/usage", labelKey: "usage",  icon: FiZap },
      { href: "/admin/ai",       labelKey: "config", icon: FiSliders },
    ],
  },
];
