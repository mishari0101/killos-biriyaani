"use client";

import { DAYS, DAY_LABELS, type DayHours } from "@/lib/settings/types";

interface BranchHoursEditorProps {
  value: DayHours[];
  onChange: (next: DayHours[]) => void;
}

export function BranchHoursEditor({ value, onChange }: BranchHoursEditorProps) {
  const patchDay = (day: DayHours["day"], partial: Partial<DayHours>) => {
    onChange(value.map((h) => (h.day === day ? { ...h, ...partial } : h)));
  };

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-[var(--admin-border)]">
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_0.9fr] gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-4 py-2.5 sm:grid">
          <span className="admin-table-th">Day</span>
          <span className="admin-table-th">Open</span>
          <span className="admin-table-th">Close</span>
          <span className="admin-table-th text-right">Closed</span>
        </div>
        {DAYS.map((day) => {
          const entry = value.find((h) => h.day === day) ?? {
            day,
            open: "10:00",
            close: "00:00",
            closed: false,
          };
          return (
            <div
              key={day}
              className="grid grid-cols-2 gap-3 border-b border-[var(--admin-border)] px-4 py-3 last:border-b-0 sm:grid-cols-[1.4fr_1fr_1fr_0.9fr] sm:items-center"
            >
              <span className="col-span-2 text-[0.82rem] font-medium text-[var(--admin-fg)] sm:col-span-1">
                {DAY_LABELS[day]}
              </span>
              <label className="sr-only" htmlFor={`branch-hours-${day}-open`}>
                {DAY_LABELS[day]} open time
              </label>
              <input
                id={`branch-hours-${day}-open`}
                type="time"
                value={entry.open}
                disabled={entry.closed}
                onChange={(e) => patchDay(day, { open: e.target.value })}
                className={`admin-input px-3 py-2 text-[0.8rem] ${
                  entry.closed ? "opacity-40" : ""
                }`}
              />
              <label className="sr-only" htmlFor={`branch-hours-${day}-close`}>
                {DAY_LABELS[day]} close time
              </label>
              <input
                id={`branch-hours-${day}-close`}
                type="time"
                value={entry.close}
                disabled={entry.closed}
                onChange={(e) => patchDay(day, { close: e.target.value })}
                className={`admin-input px-3 py-2 text-[0.8rem] ${
                  entry.closed ? "opacity-40" : ""
                }`}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  role="switch"
                  aria-checked={entry.closed}
                  aria-label={`${DAY_LABELS[day]} closed`}
                  onClick={() => patchDay(day, { closed: !entry.closed })}
                  className="admin-toggle"
                  data-on={entry.closed}
                >
                  <span className="admin-toggle-thumb" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="admin-field-hint mt-3">
        Toggle <strong>Closed</strong> for days the branch does not open. These hours drive the
        opening hours shown across the site.
      </p>
    </div>
  );
}
