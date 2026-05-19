import {
  FiAward,
  FiBriefcase,
  FiCompass,
  FiEdit3,
  FiFileText,
  FiGlobe,
  FiHome,
  FiLayout,
  FiList,
  FiMail,
  FiUploadCloud,
  FiUser,
  FiZap,
} from "react-icons/fi";
import type { NavItem } from "@/lib/types/admin";

export type { NavItem } from "@/lib/types/admin";

export const adminNavItems: NavItem[] = [
  { href: "/admin",            label: "Dashboard",  icon: FiHome },
  { href: "/admin/profile",    label: "Profile",    icon: FiUser },
  { href: "/admin/projects",   label: "Projects",   icon: FiLayout },
  { href: "/admin/experience", label: "Experience", icon: FiBriefcase },
  { href: "/admin/skills",     label: "Skills",     icon: FiList },
  { href: "/admin/education",  label: "Education",  icon: FiAward },
  { href: "/admin/blog",       label: "Blog & AI",  icon: FiEdit3 },
  { href: "/admin/messages",   label: "Inbox",      icon: FiMail },
  { href: "/admin/translations", label: "Translations", icon: FiGlobe },
  { href: "/admin/imports/linkedin", label: "LinkedIn Import", icon: FiUploadCloud },
  { href: "/admin/cv/generate", label: "CV & Cover Letter", icon: FiFileText },
  { href: "/admin/jobs",        label: "Jobs",        icon: FiCompass },
  { href: "/admin/ai/usage",    label: "AI Usage",    icon: FiZap },
];
