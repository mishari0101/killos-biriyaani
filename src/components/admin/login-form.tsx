"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LockIcon, ArrowRightLongIcon, CheckIcon, CheckCircleIcon } from "@/components/ui/icons";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not sign you in. Please try again.");
        setPending(false);
        return;
      }
      const next = searchParams.get("next");
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setPending(false);
    }
  }

  const passwordChanged = searchParams.get("changed") === "1";

  return (
    <>
      {passwordChanged && (
        <div
          role="status"
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-[rgba(46,125,50,0.35)] bg-[rgba(46,125,50,0.08)] px-4 py-3 text-[0.82rem] text-[var(--admin-fg)]"
        >
          <CheckCircleIcon
            size={16}
            className="mt-0.5 shrink-0 text-[rgba(46,125,50,0.9)]"
          />
          <span>
            Password changed. Sign in again with your new password.
          </span>
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-5">
        <div>
          <label
            htmlFor="admin-email"
            className="mb-1.5 block text-[0.8rem] font-medium text-[var(--admin-fg-soft)]"
          >
            Email address
          </label>
          <input
            ref={emailRef}
            id="admin-email"
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="admin-input"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="admin-password"
              className="block text-[0.8rem] font-medium text-[var(--admin-fg-soft)]"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="admin-link text-[0.72rem]"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="relative">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              className="admin-input pr-11"
            />
            <LockIcon
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--admin-fg-muted)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2.5 text-[0.8rem] text-[var(--admin-fg-soft)]">
            <button
              type="button"
              role="switch"
              aria-checked={remember}
              aria-label="Keep me signed in"
              onClick={() => setRemember((v) => !v)}
              className={`relative h-5 w-9 rounded-full transition-colors duration-300 ${
                remember ? "bg-[var(--accent)]" : "bg-[var(--admin-border-strong)]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${
                  remember ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
            Keep me signed in
          </label>

          <button
            type="button"
            className="admin-link text-[0.8rem]"
            onClick={() => setError("Password reset is coming in a later phase.")}
          >
            Forgot password?
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2.5 rounded-xl border border-[rgba(192,57,43,0.35)] bg-[rgba(192,57,43,0.08)] px-4 py-3 text-[0.82rem] text-[var(--brand-cta-strong)]"
        >
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--brand-cta)] text-[0.6rem] font-bold text-white">
            !
          </span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="admin-btn admin-btn-primary mt-6 w-full text-[0.9rem] font-semibold disabled:opacity-60"
      >
        {pending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a1a1a]/25 border-t-[#1a1a1a]" />
            Signing in…
          </>
        ) : (
          <>
            Sign in to dashboard
            <ArrowRightLongIcon size={17} />
          </>
        )}
      </button>

      <div className="mt-6 flex items-center justify-center gap-2 text-[0.72rem] text-[var(--admin-fg-muted)]">
        <CheckIcon size={13} />
        Secured with HttpOnly sessions
      </div>
    </form>
    </>
  );
}
