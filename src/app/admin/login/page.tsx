import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Sign in — Admin Studio",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="admin-body relative flex min-h-screen">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 50% -10%, var(--accent-soft), transparent 70%)",
        }}
      />

      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col justify-center px-6 py-12">
        <div className="admin-login-card mb-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)] font-serif text-2xl font-semibold text-[#1a1a1a] shadow-[0_16px_36px_-12px_rgba(201,162,39,0.7)]">
            K
          </div>
          <h1 className="mt-6 font-serif text-2xl font-semibold text-[var(--admin-fg)]">
            Admin Studio
          </h1>
          <p className="mt-2 text-[0.85rem] text-[var(--admin-fg-soft)]">
            Killo&rsquo;s Biriyani — manage menu, reservations, reviews &amp;
            branches.
          </p>
        </div>

        <div className="admin-card p-6 sm:p-8">
          <h2 className="text-[0.95rem] font-semibold text-[var(--admin-fg)]">
            Welcome back
          </h2>
          <p className="mb-6 mt-1 text-[0.8rem] text-[var(--admin-fg-soft)]">
            Sign in to continue to your dashboard.
          </p>
          <Suspense>
            <AdminLoginForm />
          </Suspense>
        </div>

        <div className="admin-rule-gold mx-auto mt-10 w-24" />
        <p className="mt-4 text-center text-[0.7rem] uppercase tracking-[0.22em] text-[var(--admin-fg-muted)]">
          Killo&rsquo;s Biriyani — Arabian Restaurant
        </p>
      </div>
    </div>
  );
}
