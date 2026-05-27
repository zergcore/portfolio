import type { IconType } from "react-icons";

export interface NavItem {
  href: string;
  labelKey: string;
  icon: IconType;
}

export interface NavGroup {
  labelKey: string;
  icon: IconType;
  items: NavItem[];
}

export type NavEntry = NavItem | NavGroup;
