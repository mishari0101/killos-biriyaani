"use client";

import { Field } from "./field";

interface TextAreaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  maxLength?: number;
  rows?: number;
}

export function TextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  maxLength,
  rows = 4,
}: TextAreaProps) {
  const count = maxLength ? `${value.length}/${maxLength}` : undefined;

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      htmlFor={id}
      charCount={count}
    >
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={`admin-input resize-y ${error ? "admin-input-error" : ""}`}
      />
    </Field>
  );
}
