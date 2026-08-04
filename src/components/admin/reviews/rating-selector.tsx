"use client";

import { StarIcon, StarFilledIcon } from "@/components/ui/icons";

interface RatingSelectorProps {
  value: number;
  onChange: (rating: number) => void;
  error?: string;
}

export function RatingSelector({ value, onChange, error }: RatingSelectorProps) {
  return (
    <div>
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label="Rating"
        aria-required="true"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const selected = value >= star;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
              onClick={() => onChange(star)}
              className={`group flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                selected
                  ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--admin-border-strong)] bg-[var(--admin-card)] text-[var(--admin-fg-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
              }`}
            >
              {selected ? (
                <StarFilledIcon size={18} />
              ) : (
                <StarIcon size={18} className="transition-colors group-hover:opacity-70" />
              )}
            </button>
          );
        })}
        <span className="ml-2 text-[0.8rem] font-semibold tabular-nums text-[var(--admin-fg)]">
          {value > 0 ? `${value} / 5` : "—"}
        </span>
      </div>
      {error && (
        <p className="admin-field-error mt-1.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
