"use client";

import { Field } from "./field";

interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url" | "number";
  inputMode?: "decimal" | "numeric" | "text" | "email" | "tel" | "url";
  step?: string;
  hint?: string;
  error?: string;
  maxLength?: number;
  autoComplete?: string;
}

export function TextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  step,
  hint,
  error,
  maxLength,
  autoComplete,
}: TextInputProps) {
  const count = maxLength ? `${value.length}/${maxLength}` : undefined;

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      htmlFor={id}
      charCount={count}
    >
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className={`admin-input ${error ? "admin-input-error" : ""}`}
      />
    </Field>
  );
}
