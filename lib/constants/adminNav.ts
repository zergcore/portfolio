import {
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
  FiSliders,
  FiUploadCloud,
  FiUser,
  FiZap,
} from "react-icons/fi";
import type { NavEntry } from "@/lib/types/admin";

export type { NavItem, NavGroup, NavEntry } from "@/lib/types/admin";

export const adminNavItems: NavEntry[] = [
  { href: "/admin",            label: "Dashboard",          icon: FiHome },
  { href: "/admin/profile",    label: "Profile",            icon: FiUser },
  { href: "/admin/projects",   label: "Projects",           icon: FiLayout },
  { href: "/admin/experience", label: "Experience",         icon: FiBriefcase },
  { href: "/admin/skills",     label: "Skills",             icon: FiList },
  { href: "/admin/education",  label: "Education",          icon: FiAward },
  { href: "/admin/blog",       label: "Blog",               icon: FiEdit3 },
  { href: "/admin/messages",   label: "Inbox",              icon: FiMail },
  { href: "/admin/translations", label: "Translations",     icon: FiGlobe },
  { href: "/admin/imports/linkedin", label: "LinkedIn Import", icon: FiUploadCloud },
  { href: "/admin/cv/generate", label: "CV & Cover Letter", icon: FiFileText },
  { href: "/admin/jobs",        label: "Jobs",              icon: FiCompass },
  {
    label: "AI",
    icon: FiCpu,
    items: [
      { href: "/admin/ai/usage", label: "Usage",  icon: FiZap },
      { href: "/admin/ai",       label: "Config", icon: FiSliders },
    ],
  },
];
