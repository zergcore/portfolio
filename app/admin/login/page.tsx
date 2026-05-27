"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FiLock, FiMail } from "react-icons/fi";

import { loginAction } from "@/app/actions/auth";
import Button from "@/components/ui/Button";
import GradientText from "@/components/typography/GradientText";

// Define the expected state signature for your Server Action
export interface AuthState {
  error?: string;
}

const initialState: AuthState = {};

export default function LoginPage() {
  // 💡 React 19 paradigm: Native form state management without manual transitions
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <main className="isolate flex min-h-[100dvh] items-center justify-center bg-[var(--bg-base)] px-4">
      {/* GPU-Accelerated Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[40vw] w-[40vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-violet)]/10 blur-[100px] transform-gpu"
      />

      <section className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 shadow-xl">
          <header className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              <GradientText>Admin Portal</GradientText>
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Sign in to manage your portfolio content.
            </p>
          </header>

          {/* 💡 Native form action handles formData extraction automatically */}
          <form action={formAction} className="flex flex-col gap-6">

            {state?.error && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-[var(--color-error)]/20 bg-[var(--color-error)]/10 p-3 text-center text-sm font-medium text-[var(--color-error)]"
              >
                {state.error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              {/* 💡 Semantic A11y linking */}
              <label htmlFor="email" className="ml-1 text-sm font-medium text-[var(--text-secondary)]">
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-muted)]">
                  <FiMail size={18} aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  disabled={isPending}
                  placeholder="admin@zergcore.dev"
                  className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] py-2.5 pl-10 pr-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent-violet)] disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="ml-1 text-sm font-medium text-[var(--text-secondary)]">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-muted)]">
                  <FiLock size={18} aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  disabled={isPending}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] py-2.5 pl-10 pr-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent-violet)] disabled:opacity-50"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-2 w-full justify-center"
              disabled={isPending}
              aria-disabled={isPending}
            >
              {isPending ? "Authenticating..." : "Sign In"}
            </Button>
          </form>

          <footer className="mt-6 text-center">
            {/* 💡 Native link for zero-JS navigation and prefetching */}
            <Link
              href="/"
              className="rounded-md text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-violet)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)]"
            >
              &larr; Back to Portfolio
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}