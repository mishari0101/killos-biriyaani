"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  id?: string;
}

export function Toggle({ checked, onChange, label, description, id }: ToggleProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer items-center gap-3 text-left"
    >
      <span className="admin-toggle" data-on={checked} aria-hidden="true">
        <span className="admin-toggle-thumb" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.82rem] font-medium text-[var(--admin-fg)]">{label}</span>
        {description && (
          <span className="text-[0.72rem] text-[var(--admin-fg-muted)]">{description}</span>
        )}
      </span>
    </button>
  );
}
