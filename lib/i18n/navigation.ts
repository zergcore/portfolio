import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";
import type { getTranslations } from "next-intl/server";
import type { useTranslations } from "next-intl";

export const { Link, useRouter, usePathname, redirect, permanentRedirect } =
  createNavigation(routing);

// Reusable type for Server Components
export type ServerTranslation<Namespace extends string = never> = Awaited<
  ReturnType<typeof getTranslations<Namespace>>
>;

// Reusable type for Client Components
export type ClientTranslation<Namespace extends string = never> = ReturnType<
  typeof useTranslations<Namespace>
>;