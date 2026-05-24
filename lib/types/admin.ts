import type { IconType } from "react-icons";

export interface NavItem {
  href: string;
  label: string;
  icon: IconType;
}

export interface NavGroup {
  label: string;
  icon: IconType;
  items: NavItem[];
}

export type NavEntry = NavItem | NavGroup;
