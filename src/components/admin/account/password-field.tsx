"use client";

import { useState } from "react";
import { Field } from "@/components/admin/settings/field";
import { EyeIcon } from "@/components/ui/icons";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  autoComplete?: string;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  autoComplete,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Field label={label} hint={hint} error={error} htmlFor={id}>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`admin-input pr-12 ${error ? "admin-input-error" : ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-[var(--admin-fg-muted)] transition-colors hover:text-[var(--admin-fg)]"
        >
          <EyeIcon size={17} />
        </button>
      </div>
    </Field>
  );
}
