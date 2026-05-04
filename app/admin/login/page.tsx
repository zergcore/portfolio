"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import Button from "@/components/ui/Button";
import GradientText from "@/components/typography/GradientText";
import { FiLock, FiMail } from "react-icons/fi";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push("/admin");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-[var(--accent-violet)]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              <GradientText>Admin Portal</GradientText>
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Sign in to manage your portfolio content.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <FiMail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@zergcore.dev"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl py-2.5 pl-10 pr-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-violet)] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <FiLock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl py-2.5 pl-10 pr-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-violet)] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full justify-center mt-2"
              disabled={isPending}
            >
              {isPending ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => router.push('/')}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              &larr; Back to Portfolio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
