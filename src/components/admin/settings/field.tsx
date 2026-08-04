"use client";

import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  charCount?: string;
  children: ReactNode;
}

export function Field({ label, hint, error, htmlFor, charCount, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="admin-field-label">
          {label}
        </label>
        {charCount && <span className={`admin-char-count ${error ? "is-limit" : ""}`}>{charCount}</span>}
      </div>
      {children}
      {hint && !error && <p className="admin-field-hint">{hint}</p>}
      {error && (
        <p className="admin-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
