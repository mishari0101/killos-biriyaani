"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { DayPicker } from "react-day-picker";
import {
  contact,
  enquiryForm,
  enquirySuccess,
  formLabels,
  occasionOptions,
  submitCta,
  success,
} from "@/lib/content/contact";
import {
  submitContactMessage,
  submitReservation,
  toContactPayload,
  toReservationPayload,
  validateContactFields,
  validateReservationFields,
  type EnquiryFieldKey,
  type EnquiryFormValues,
  type ReservationFieldKey,
  type ReservationFormValues,
} from "@/lib/contact";


import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  MailIcon,
  MessageSquareIcon,
  PhoneIcon,
  SparklesIcon,
  UserIcon,
  UsersIcon,
} from "@/components/ui/icons";

const GUEST_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);
const FIELD_ORDER: ReservationFieldKey[] = [
  "name",
  "phone",
  "guests",
  "date",
  "time",
  "request",
];

type Values = ReservationFormValues;
type Status = "idle" | "submitting" | "success" | "error";

const EMPTY: Values = {
  name: "",
  phone: "",
  guests: "",
  date: "",
  time: "",
  occasion: "",
  request: "",
};

function validateOne(key: ReservationFieldKey, values: Values): string {
  return validateReservationFields(values)[key] ?? "";
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseISODate(iso: string): Date | undefined {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatTime(hm: string): string {
  const [hStr, mStr] = hm.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return hm;
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/* Reservation time slots. Slots are generated every TIME_STEP_MINUTES between
   opening and last seating so the interval stays configurable in one place. */
const TIME_STEP_MINUTES = 15;
const TIME_FIRST_MINUTES = 10 * 60;
const TIME_LAST_MINUTES = 23 * 60 + 45;

const TIME_OPTIONS = (() => {
  const options: string[] = [];
  for (let t = TIME_FIRST_MINUTES; t <= TIME_LAST_MINUTES; t += TIME_STEP_MINUTES) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    options.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return options;
})();

const RDP_CLASSNAMES = {
  root: "contact-calendar",
  months: "contact-calendar-months",
  month: "contact-calendar-month",
  month_grid: "contact-calendar-grid",
  month_caption: "contact-calendar-caption",
  caption_label: "contact-calendar-caption-label",
  nav: "contact-calendar-nav",
  button_previous: "contact-calendar-nav-btn",
  button_next: "contact-calendar-nav-btn",
  chevron: "contact-calendar-chevron",
  weekdays: "contact-calendar-weekdays",
  weekday: "contact-calendar-weekday",
  weeks: "contact-calendar-weeks",
  week: "contact-calendar-week",
  day: "contact-calendar-day",
  day_button: "contact-calendar-day-button",
  today: "contact-calendar-today",
  selected: "contact-calendar-selected",
  disabled: "contact-calendar-disabled",
  outside: "contact-calendar-outside",
  focused: "contact-calendar-focused",
} as const;

/* Closes a picker on outside pointer-down or Escape. `onClose` is expected to
   return focus to the trigger so keyboard users keep their place. */
function usePickerDismiss({
  open,
  onClose,
  ref,
}: {
  open: boolean;
  onClose: () => void;
  ref: React.RefObject<HTMLElement | null>;
}) {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, ref]);
}

/* ---------------------- Shared form visual layer ---------------------- */

/* Floating-label text inputs, selects and picker triggers share one visual
   language: rounded fields, gold focus ring and a small floated label. */
const fieldBase =
  "w-full rounded-xl border border-[var(--contact-field-border)] bg-[var(--contact-field-bg)] text-sm font-medium text-[var(--fg)] outline-none transition-all duration-200 placeholder:text-transparent focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]";

const fieldInput = `${fieldBase} h-[52px] pt-5 pb-2`;

const fieldError = "border-[var(--brand-cta)] focus:border-[var(--brand-cta)] focus:ring-[rgba(192,57,43,0.14)]";

/* Floated label position on focus/filled (peer + placeholder-shown trick). */
const labelFloated =
  "peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.15em] peer-focus:text-[var(--accent)] peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.15em] peer-[:not(:placeholder-shown)]:text-[var(--accent)]";

const labelFloatedArea =
  "peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.15em] peer-focus:text-[var(--accent)] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.15em] peer-[:not(:placeholder-shown)]:text-[var(--accent)]";

const fieldLabel =
  "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--fg-muted)] transition-all duration-200";

const fieldIcon =
  "pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--accent)] opacity-60";

/* Form group heading — gold overline with a fading gold divider. */
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
        {children}
      </h3>
      <div
        aria-hidden="true"
        className="mt-2 h-px w-full bg-gradient-to-r from-[rgba(201,162,39,0.7)] via-[rgba(201,162,39,0.15)] to-transparent"
      />
    </div>
  );
}

/* ------------------------------ Field ------------------------------ */

type FieldIcon = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>;

function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
  multiline,
  type = "text",
  autoComplete,
  inputMode,
  rows = 2,
  icon: Icon,
  iconSide = "left",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "numeric" | "email";
  rows?: number;
  icon?: FieldIcon;
  iconSide?: "left" | "right";
}) {
  const hasLeftIcon = Boolean(Icon && iconSide === "left");
  const hasRightIcon = Boolean(Icon && iconSide === "right");
  const className = [
    multiline ? `${fieldBase} min-h-[84px] resize-none pt-7 pb-3` : fieldInput,
    hasLeftIcon ? "pl-11" : "pl-4",
    hasRightIcon ? "pr-11" : "pr-4",
    error ? fieldError : "",
  ].join(" ");

  const common = {
    id,
    className,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    onBlur: () => onBlur(),
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };

  return (
    <div className="space-y-1">
      <div className="relative">
        {multiline ? (
          <textarea {...common} rows={rows} placeholder=" " />
        ) : (
          <input
            {...common}
            type={type}
            placeholder=" "
            autoComplete={autoComplete}
            inputMode={inputMode}
          />
        )}
        {Icon && (
          <Icon
            size={16}
            aria-hidden="true"
            className={`${fieldIcon} ${
              iconSide === "right" ? "right-4" : "left-4"
            }`}
          />
        )}
        <label
          htmlFor={id}
          className={`${fieldLabel} ${multiline ? "top-4" : ""} ${
            multiline ? labelFloatedArea : labelFloated
          } ${hasLeftIcon ? "left-11" : "left-4"}`}
        >
          {label}
          {required && <span className="text-[var(--brand-cta)]"> *</span>}
        </label>
      </div>
      <p
        id={`${id}-error`}
        className={`contact-field-error ${
          error ? "contact-field-error-show" : ""
        }`}
      >
        {error ?? ""}
      </p>
    </div>
  );
}

/* --------------------------- Date picker --------------------------- */

function DateField({
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  required?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const floated = open || focused || value !== "";
  const today = startOfToday();
  const selected = parseISODate(value);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  usePickerDismiss({ open, onClose: close, ref: wrapRef });

  const handleSelect = useCallback(
    (day: Date | undefined) => {
      if (!day) return;
      onChange(toISODate(day));
      setOpen(false);
      triggerRef.current?.focus();
    },
    [onChange]
  );

  return (
    <div className="space-y-1">
      <div
        ref={wrapRef}
        className="relative"
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && wrapRef.current?.contains(next)) return;
          setFocused(false);
          setOpen(false);
          onBlur();
        }}
      >
        <button
          ref={triggerRef}
          type="button"
          id="date"
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="date-calendar"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "date-error" : undefined}
          className={`${fieldInput} flex cursor-pointer appearance-none select-none items-center pr-11 text-left ${
            open ? "border-[var(--accent)] ring-4 ring-[var(--accent-soft)]" : ""
          } ${error ? fieldError : ""}`}
          onClick={() => (open ? close() : setOpen(true))}
          onKeyDown={(e) => {
            if (
              !open &&
              (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")
            ) {
              e.preventDefault();
              setOpen(true);
            }
          }}
        >
          <span
            className={`block truncate text-sm font-medium ${
              value ? "text-[var(--fg)]" : "text-[var(--fg-muted)]"
            }`}
          >
            {value ? formatDate(value) : focused || open ? "Select Date" : ""}
          </span>
        </button>
        <label
          htmlFor="date"
          className={`pointer-events-none absolute left-4 text-sm font-medium transition-all duration-200 ${
            floated
              ? "top-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent)]"
              : "top-1/2 -translate-y-1/2 text-[var(--fg-muted)]"
          }`}
        >
          {label}
          {required && <span className="text-[var(--brand-cta)]"> *</span>}
        </label>
        <span className={`${fieldIcon} right-4`} aria-hidden="true">
          <CalendarIcon size={16} />
        </span>
        {open && (
          <div
            id="date-calendar"
            className="contact-picker-panel"
            role="dialog"
            aria-label={label}
          >
            <DayPicker
              mode="single"
              required
              selected={selected}
              onSelect={handleSelect}
              defaultMonth={selected ?? today}
              startMonth={new Date(today.getFullYear(), today.getMonth(), 1)}
              disabled={{ before: today }}
              weekStartsOn={1}
              showOutsideDays
              animate={false}
              navLayout="around"
              autoFocus
              classNames={RDP_CLASSNAMES}
            />
          </div>
        )}
      </div>
      <p
        id="date-error"
        className={`contact-field-error ${
          error ? "contact-field-error-show" : ""
        }`}
      >
        {error ?? ""}
      </p>
    </div>
  );
}

/* --------------------------- Time picker --------------------------- */

function TimeField({
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  required?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const floated = open || focused || value !== "";

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  usePickerDismiss({ open, onClose: close, ref: wrapRef });

  useEffect(() => {
    if (!open) return;
    const target = Math.max(0, TIME_OPTIONS.indexOf(value));
    (optionRefs.current[target] ?? optionRefs.current[0])?.focus();
  }, [open, value]);

  const selectTime = useCallback(
    (time: string) => {
      onChange(time);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [onChange]
  );

  const moveFocus = (dir: 1 | -1) => {
    const next =
      (activeIndex + dir + TIME_OPTIONS.length) % TIME_OPTIONS.length;
    optionRefs.current[next]?.focus();
  };

  const handleListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveFocus(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(-1);
        break;
      case "Home":
        e.preventDefault();
        optionRefs.current[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        optionRefs.current[TIME_OPTIONS.length - 1]?.focus();
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      default:
        if (e.key.length === 1) {
          const idx = TIME_OPTIONS.findIndex((t) => t.startsWith(e.key));
          if (idx >= 0) optionRefs.current[idx]?.focus();
        }
    }
  };

  return (
    <div className="space-y-1">
      <div
        ref={wrapRef}
        className="relative"
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && wrapRef.current?.contains(next)) return;
          setFocused(false);
          setOpen(false);
          onBlur();
        }}
      >
        <button
          ref={triggerRef}
          type="button"
          id="time"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls="time-listbox"
          aria-autocomplete="none"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "time-error" : undefined}
          className={`${fieldInput} flex cursor-pointer appearance-none select-none items-center pr-11 text-left ${
            open ? "border-[var(--accent)] ring-4 ring-[var(--accent-soft)]" : ""
          } ${error ? fieldError : ""}`}
          onClick={() => (open ? close() : setOpen(true))}
          onKeyDown={(e) => {
            if (
              !open &&
              (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")
            ) {
              e.preventDefault();
              setOpen(true);
            }
          }}
        >
          <span
            className={`block truncate text-sm font-medium ${
              value ? "text-[var(--fg)]" : "text-[var(--fg-muted)]"
            }`}
          >
            {value ? formatTime(value) : focused || open ? "Select Time" : ""}
          </span>
        </button>
        <label
          htmlFor="time"
          className={`pointer-events-none absolute left-4 text-sm font-medium transition-all duration-200 ${
            floated
              ? "top-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent)]"
              : "top-1/2 -translate-y-1/2 text-[var(--fg-muted)]"
          }`}
        >
          {label}
          {required && <span className="text-[var(--brand-cta)]"> *</span>}
        </label>
        <span className={`${fieldIcon} right-4`} aria-hidden="true">
          <ClockIcon size={16} />
        </span>
        {open && (
          <div
            id="time-listbox"
            role="listbox"
            aria-label={label}
            onKeyDown={handleListKeyDown}
            className="contact-picker-panel"
          >
            <div className="contact-time-list">
              {TIME_OPTIONS.map((time, i) => (
                <button
                  key={time}
                  type="button"
                  role="option"
                  aria-selected={time === value}
                  tabIndex={time === value ? 0 : -1}
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  className={`contact-time-option ${
                    time === value ? "contact-time-option-selected" : ""
                  }`}
                  onClick={() => selectTime(time)}
                  onFocus={() => setActiveIndex(i)}
                >
                  <span>{formatTime(time)}</span>
                  {time === value && (
                    <CheckIcon size={13} aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <p
        id="time-error"
        className={`contact-field-error ${
          error ? "contact-field-error-show" : ""
        }`}
      >
        {error ?? ""}
      </p>
    </div>
  );
}

function GuestsField({
  value,
  onChange,
  onBlur,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value !== "";

  return (
    <div className="space-y-1">
      <div className="relative">
        <select
          id="guests"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur();
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "guests-error" : undefined}
          className={`${fieldBase} h-[52px] cursor-pointer appearance-none pl-11 pr-10 [&>option]:bg-[var(--bg-soft)] [&>option]:text-[var(--fg)] ${
            error ? fieldError : ""
          }`}
        >
          <option value="" disabled hidden />
          {GUEST_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "Guest" : "Guests"}
            </option>
          ))}
        </select>
        <span className={`${fieldIcon} left-4`} aria-hidden="true">
          <UsersIcon size={16} />
        </span>
        <ChevronDownIcon
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]"
        />
        <label
          htmlFor="guests"
          className={`pointer-events-none absolute left-11 text-sm font-medium transition-all duration-200 ${
            floated
              ? "top-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent)]"
              : "top-1/2 -translate-y-1/2 text-[var(--fg-muted)]"
          }`}
        >
          {formLabels.guests}
          <span className="text-[var(--brand-cta)]"> *</span>
        </label>
      </div>
      <p
        id="guests-error"
        className={`contact-field-error ${
          error ? "contact-field-error-show" : ""
        }`}
      >
        {error ?? ""}
      </p>
    </div>
  );
}

function OccasionField({
  value,
  onChange,
  onBlur,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value !== "";

  return (
    <div className="space-y-1">
      <div className="relative">
        <select
          id="occasion"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur();
          }}
          className={`${fieldBase} h-[52px] cursor-pointer appearance-none pl-11 pr-10 [&>option]:bg-[var(--bg-soft)] [&>option]:text-[var(--fg)]`}
        >
          <option value="" disabled hidden />
          {occasionOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className={`${fieldIcon} left-4`} aria-hidden="true">
          <SparklesIcon size={16} />
        </span>
        <ChevronDownIcon
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]"
        />
        <label
          htmlFor="occasion"
          className={`pointer-events-none absolute left-11 text-sm font-medium transition-all duration-200 ${
            floated
              ? "top-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent)]"
              : "top-1/2 -translate-y-1/2 text-[var(--fg-muted)]"
          }`}
        >
          {formLabels.occasion}
        </label>
      </div>
      <p id="occasion-error" className="contact-field-error" />
    </div>
  );
}

/* --------------------------- Success card --------------------------- */

function SuccessCard({
  title,
  numberLabel,
  message,
  number,
  onReset,
}: {
  title: string;
  numberLabel: string;
  message: string;
  number?: string | null;
  onReset: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[560px] flex-col items-center justify-center text-center"
    >
      <span className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--accent-soft)] bg-[var(--accent-soft)] text-[var(--accent)]">
        <CheckIcon size={38} />
      </span>
      <h3
        className="mt-7 text-[clamp(1.6rem,3vw,2.1rem)] font-bold leading-tight text-[var(--fg)]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {title}
      </h3>
      {number && (
        <div className="mt-6 rounded-2xl border border-[var(--accent-soft)] bg-[var(--accent-soft)] px-8 py-4">
          <p className="text-[0.66rem] font-light uppercase tracking-[0.3em] text-[var(--accent)]">
            {numberLabel}
          </p>
          <p className="mt-1 font-serif text-[1.5rem] font-bold tracking-[0.12em] text-[var(--fg)]">
            {number}
          </p>
        </div>
      )}
      <p className="mx-auto mt-4 max-w-[38ch] text-[0.95rem] font-normal leading-[1.8] text-[var(--fg-soft)]">
        {message}
      </p>
      <div className="mt-9 grid w-full max-w-sm gap-3">
        <a href="#home" onClick={onReset} className="btn btn-outline btn-lg w-full">
          Back to Home
        </a>
      </div>
    </div>
  );
}

/* --------------------------- Enquiry form --------------------------- */

const ENQUIRY_EMPTY: EnquiryFormValues = {
  name: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
};

const ENQUIRY_FIELD_ORDER: EnquiryFieldKey[] = [
  "name",
  "phone",
  "email",
  "subject",
  "message",
];

type EnquiryStatus = "idle" | "submitting" | "success" | "error";

function validateEnquiryOne(key: EnquiryFieldKey, values: EnquiryFormValues): string {
  return validateContactFields(values)[key] ?? "";
}

function EnquiryForm({
  formRef,
  submitBtnRef,
  onStatusChange,
  onSuccess,
}: {
  formRef: React.RefObject<HTMLFormElement | null>;
  submitBtnRef: React.RefObject<HTMLButtonElement | null>;
  onStatusChange: (status: EnquiryStatus) => void;
  onSuccess: (number: string) => void;
}) {
  const [values, setValues] = useState<EnquiryFormValues>(ENQUIRY_EMPTY);
  const [errors, setErrors] = useState<Partial<Record<EnquiryFieldKey, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<EnquiryFieldKey, boolean>>>({});
  const [status, setStatus] = useState<EnquiryStatus>("idle");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    onStatusChange(status);
  }, [status, onStatusChange]);

  const setField = (key: EnquiryFieldKey, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched[key]) {
      setErrors((prev) => ({ ...prev, [key]: validateEnquiryOne(key, next) }));
    }
  };

  const blurField = (key: EnquiryFieldKey) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: validateEnquiryOne(key, values) }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    const nextTouched = {
      name: true,
      phone: true,
      email: true,
      subject: true,
      message: true,
    };
    const nextErrors = validateContactFields(values);
    setTouched(nextTouched);
    setErrors(nextErrors);

    const first = ENQUIRY_FIELD_ORDER.find((key) => nextErrors[key]);
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }

    setStatus("submitting");
    setSubmitError("");
    const result = await submitContactMessage(toContactPayload(values));
    if (result.ok) {
      setValues(ENQUIRY_EMPTY);
      setErrors({});
      setTouched({});
      setStatus("success");
      onSuccess(result.number ?? "");
    } else {
      setStatus("error");
      setSubmitError(result.error ?? "Something went wrong. Please try again.");
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={status === "submitting"}
    >
      <div className="space-y-4 lg:space-y-8">
        <div>
          <SectionLabel>Your Details</SectionLabel>
          <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2 lg:gap-y-5">
            <Field
              id="name"
              label={enquiryForm.name}
              value={values.name}
              onChange={(v) => setField("name", v)}
              onBlur={() => blurField("name")}
              error={touched.name ? errors.name : undefined}
              required
              autoComplete="name"
              icon={UserIcon}
            />
            <Field
              id="phone"
              label={enquiryForm.phone}
              value={values.phone}
              onChange={(v) => setField("phone", v)}
              onBlur={() => blurField("phone")}
              error={touched.phone ? errors.phone : undefined}
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              icon={PhoneIcon}
            />
          </div>
        </div>
        <div>
          <SectionLabel>Your Message</SectionLabel>
          <div className="space-y-4 lg:space-y-5">
            <Field
              id="email"
              label={enquiryForm.email}
              value={values.email}
              onChange={(v) => setField("email", v)}
              onBlur={() => blurField("email")}
              error={touched.email ? errors.email : undefined}
              type="email"
              inputMode="email"
              autoComplete="email"
              icon={MailIcon}
            />
            <Field
              id="subject"
              label={enquiryForm.subject}
              value={values.subject}
              onChange={(v) => setField("subject", v)}
              onBlur={() => blurField("subject")}
              error={touched.subject ? errors.subject : undefined}
              required
            />
            <Field
              id="message"
              label={enquiryForm.message}
              value={values.message}
              onChange={(v) => setField("message", v)}
              onBlur={() => blurField("message")}
              error={touched.message ? errors.message : undefined}
              required
              multiline
              rows={5}
            />
          </div>
        </div>
      </div>

      {status === "error" && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-[rgba(192,57,43,0.25)] bg-[rgba(192,57,43,0.08)] px-4 py-3 text-[0.82rem] font-medium text-[var(--brand-cta)]"
        >
          {submitError}
        </div>
      )}

      <button
        ref={submitBtnRef}
        type="submit"
        disabled={status === "submitting"}
        className="mt-9 inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-red-500 to-orange-400 px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-[rgba(255,112,67,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--contact-card-bg)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-75"
      >
        {status === "submitting" ? (
          <span className="flex items-center gap-3">
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              aria-hidden="true"
            />
            {enquiryForm.loading}
          </span>
        ) : (
          <span className="flex items-center gap-3">
            <MailIcon size={16} />
            {enquiryForm.idle}
          </span>
        )}
      </button>
      <p className="mt-5 text-center text-[0.7rem] font-normal tracking-[0.02em] text-[var(--fg-muted)]">
        {enquiryForm.footnote}
      </p>
    </form>
  );
}

/* ------------------------------- Section ------------------------------- */

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const formWrapRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const enqFormRef = useRef<HTMLFormElement>(null);
  const enqSubmitBtnRef = useRef<HTMLButtonElement>(null);

  const [mode, setMode] = useState<"reservation" | "message">("reservation");
  const [step, setStep] = useState<1 | 2>(1);
  const [inView, setInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<ReservationFieldKey, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<ReservationFieldKey, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState("");
  const [reservationNumber, setReservationNumber] = useState<string | null>(null);
  const [enqStatus, setEnqStatus] = useState<EnquiryStatus>("idle");
  const [enqNumber, setEnqNumber] = useState<string | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const setField = (key: ReservationFieldKey, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched[key]) {
      setErrors((prev) => ({ ...prev, [key]: validateOne(key, next) }));
    }
  };

  const blurField = (key: ReservationFieldKey) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: validateOne(key, values) }));
  };

  const goToStep = (next: 1 | 2) => {
    setStep(next);
    formWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNext = () => {
    const nextTouched = { name: true, phone: true } as const;
    const nextErrors = {
      name: validateOne("name", values),
      phone: validateOne("phone", values),
    };
    setTouched(nextTouched);
    setErrors(nextErrors);
    const first = (["name", "phone"] as const).find((key) => nextErrors[key]);
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }
    goToStep(2);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    if (isMobile && step === 1) {
      handleNext();
      return;
    }

    if (isMobile && step === 2) {
      const detailsErrors = {
        name: validateOne("name", values),
        phone: validateOne("phone", values),
      };
      if (detailsErrors.name || detailsErrors.phone) {
        setTouched((prev) => ({ ...prev, name: true, phone: true }));
        setErrors((prev) => ({ ...prev, ...detailsErrors }));
        goToStep(1);
        return;
      }
    }

    const nextTouched = {
      name: true,
      phone: true,
      guests: true,
      date: true,
      time: true,
      request: true,
    } as const;
    const nextErrors = validateReservationFields(values);
    setTouched(nextTouched);
    setErrors(nextErrors);

    const first = FIELD_ORDER.find((key) => nextErrors[key]);
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }

    setStatus("submitting");
    setSubmitError("");
    const result = await submitReservation(toReservationPayload(values));
    if (result.ok) {
      setValues(EMPTY);
      setErrors({});
      setTouched({});
      setReservationNumber(result.number ?? null);
      setStatus("success");
    } else {
      setStatus("error");
      setSubmitError(
        result.error ?? "Something went wrong. Please try again."
      );
      formWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setValues(EMPTY);
    setErrors({});
    setTouched({});
    setStatus("idle");
    setSubmitError("");
    setReservationNumber(null);
    setStep(1);
  };

  const handleEnquiryReset = () => {
    setMode("message");
    setEnqStatus("idle");
    setEnqNumber(null);
  };

  const switchMode = (next: "reservation" | "message") => {
    setMode(next);
    setStep(1);
    setEnqNumber(null);
    setEnqStatus("idle");
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className={`relative scroll-mt-28 bg-[var(--contact-bg)] pt-24 pb-32 lg:pt-36 lg:pb-40 ${
        inView ? "contact-in" : ""
      }`}
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="text-center">
          <p
            className="contact-item text-[0.7rem] font-light uppercase tracking-[0.42em] text-[var(--accent)]"
            style={{ "--d": "0ms" } as React.CSSProperties}
          >
            {contact.eyebrow}
          </p>
          <h2
            id="contact-heading"
            className="contact-item mt-6 text-[clamp(2.4rem,4.8vw,4.1rem)] font-bold uppercase leading-[1.02] tracking-[-0.01em] text-[var(--fg)]"
            style={
              { fontFamily: "var(--font-display)", "--d": "120ms" } as React.CSSProperties
            }
          >
            {contact.titleA}
            <em className="mt-1 block not-italic text-[var(--accent)]">
              {contact.titleB}
            </em>
          </h2>
          <p
            className="contact-item mx-auto mt-6 max-w-[52ch] text-[1rem] font-normal leading-[1.8] text-[var(--fg-soft)]"
            style={{ "--d": "240ms" } as React.CSSProperties}
          >
            {contact.description}
          </p>
        </div>

        <div className="mt-14 lg:mt-16">
          {/* ---- Reservation / enquiry form ---- */}
          <div
            id="reservation"
            ref={formWrapRef}
            className="contact-item mx-auto w-full max-w-[800px] scroll-mt-28 rounded-[28px] border border-[var(--contact-card-border)] bg-[var(--contact-card-bg)] p-6 shadow-[var(--contact-card-shadow)] backdrop-blur-[16px] sm:p-8 lg:p-9"
            style={{ "--d": "700ms" } as React.CSSProperties}
          >
            {mode === "message" && enqStatus === "success" ? (
              <SuccessCard
                title={enquirySuccess.title}
                numberLabel={enquirySuccess.numberLabel}
                message={enquirySuccess.message}
                number={enqNumber}
                onReset={handleEnquiryReset}
              />
            ) : status === "success" ? (
              <SuccessCard
                title={success.title}
                numberLabel={success.numberLabel}
                message={success.message}
                number={reservationNumber}
                onReset={handleReset}
              />
            ) : (
              <>
                <div className="mb-10">
                  <div
                    role="tablist"
                    aria-label="Contact form"
                    className="grid w-full max-w-[360px] grid-cols-2 gap-1 rounded-full border border-[var(--contact-card-border)] bg-[var(--contact-tabs-bg)] p-1"
                  >
                    <button
                      type="button"
                      role="tab"
                      id="tab-book"
                      aria-selected={mode === "reservation"}
                      aria-controls="panel-book"
                      onClick={() => switchMode("reservation")}
                      className={`flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 text-[0.78rem] font-semibold tracking-[0.03em] transition-all duration-300 ${
                        mode === "reservation"
                          ? "bg-gradient-to-r from-red-500 to-orange-400 text-white shadow-lg shadow-[rgba(255,112,67,0.35)]"
                          : "text-[var(--fg-soft)] hover:text-[var(--fg)]"
                      }`}
                    >
                      <CalendarIcon size={14} className="shrink-0" />
                      <span className="truncate">Reserve a Table</span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      id="tab-message"
                      aria-selected={mode === "message"}
                      aria-controls="panel-message"
                      onClick={() => switchMode("message")}
                      className={`flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 text-[0.78rem] font-semibold tracking-[0.03em] transition-all duration-300 ${
                        mode === "message"
                          ? "bg-gradient-to-r from-red-500 to-orange-400 text-white shadow-lg shadow-[rgba(255,112,67,0.35)]"
                          : "text-[var(--fg-soft)] hover:text-[var(--fg)]"
                      }`}
                    >
                      <MessageSquareIcon size={14} className="shrink-0" />
                      <span className="truncate">Send a Message</span>
                    </button>
                  </div>
                </div>

                {mode === "message" ? (
                  <div
                    role="tabpanel"
                    id="panel-message"
                    aria-labelledby="tab-message"
                  >
                    <EnquiryForm
                      formRef={enqFormRef}
                      submitBtnRef={enqSubmitBtnRef}
                      onStatusChange={setEnqStatus}
                      onSuccess={(n) => setEnqNumber(n)}
                    />
                  </div>
                ) : (
                  <div
                    role="tabpanel"
                    id="panel-book"
                    aria-labelledby="tab-book"
                  >
                    <form
                      ref={formRef}
                      onSubmit={handleSubmit}
                      noValidate
                      aria-busy={status === "submitting"}
                    >
                      <div className="space-y-4 lg:space-y-8">
                        <div className="lg:hidden">
                          <div className="flex items-center justify-between">
                            <p className="contact-step-label">
                              Step {step} of 2
                            </p>
                            <p className="contact-step-hint">
                              {step === 1
                                ? "Your Details"
                                : "Reservation Details"}
                            </p>
                          </div>
                          <div
                            className="contact-step-track"
                            aria-hidden="true"
                          >
                            <div
                              className="contact-step-fill"
                              style={{ width: step === 1 ? "50%" : "100%" }}
                            />
                          </div>
                        </div>

                        <div className={step === 1 ? "" : "hidden lg:block"}>
                          <SectionLabel>Your Details</SectionLabel>
                          <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2 lg:gap-y-5">
                            <Field
                              id="name"
                              label={formLabels.name}
                              value={values.name}
                              onChange={(v) => setField("name", v)}
                              onBlur={() => blurField("name")}
                              error={touched.name ? errors.name : undefined}
                              required
                              autoComplete="name"
                              icon={UserIcon}
                            />
                            <Field
                              id="phone"
                              label={formLabels.phone}
                              value={values.phone}
                              onChange={(v) => setField("phone", v)}
                              onBlur={() => blurField("phone")}
                              error={touched.phone ? errors.phone : undefined}
                              required
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              icon={PhoneIcon}
                            />
                          </div>
                        </div>

                        <div className={step === 2 ? "" : "hidden lg:block"}>
                          <SectionLabel>Reservation Details</SectionLabel>
                          <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2 lg:gap-y-5">
                            <GuestsField
                              value={values.guests}
                              onChange={(v) => setField("guests", v)}
                              onBlur={() => blurField("guests")}
                              error={touched.guests ? errors.guests : undefined}
                            />
                            <DateField
                              label={formLabels.date}
                              value={values.date}
                              onChange={(v) => setField("date", v)}
                              onBlur={() => blurField("date")}
                              error={touched.date ? errors.date : undefined}
                              required
                            />
                            <TimeField
                              label={formLabels.time}
                              value={values.time}
                              onChange={(v) => setField("time", v)}
                              onBlur={() => blurField("time")}
                              error={touched.time ? errors.time : undefined}
                              required
                            />
                            <OccasionField
                              value={values.occasion}
                              onChange={(v) => setField("occasion", v)}
                              onBlur={() => blurField("occasion")}
                            />
                          </div>
                        </div>

                        <div className={step === 2 ? "" : "hidden lg:block"}>
                          <SectionLabel>Notes</SectionLabel>
                          <div className="space-y-4 lg:space-y-5">
                            <Field
                              id="request"
                              label={formLabels.request}
                              value={values.request}
                              onChange={(v) => setField("request", v)}
                              onBlur={() => blurField("request")}
                              error={touched.request ? errors.request : undefined}
                              multiline
                            />
                          </div>
                        </div>
                      </div>

                      {status === "error" && (
                        <div
                          role="alert"
                          className="mt-6 rounded-2xl border border-[rgba(192,57,43,0.25)] bg-[rgba(192,57,43,0.08)] px-4 py-3 text-[0.82rem] font-medium text-[var(--brand-cta)]"
                        >
                          {submitError}
                        </div>
                      )}

                      {isMobile && step === 2 ? (
                        <button
                          type="button"
                          onClick={() => goToStep(1)}
                          className="btn btn-outline btn-lg w-full"
                        >
                          Back
                        </button>
                      ) : null}

                      <button
                        ref={submitBtnRef}
                        type="submit"
                        disabled={status === "submitting"}
                        className={`mt-9 inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-red-500 to-orange-400 px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-[rgba(255,112,67,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--contact-card-bg)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-75 ${
                          isMobile && step === 2 ? "!mt-4" : ""
                        }`}
                      >
                        {status === "submitting" ? (
                          <span className="flex items-center gap-3">
                            <span
                              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                              aria-hidden="true"
                            />
                            {submitCta.loading}
                          </span>
                        ) : isMobile && step === 1 ? (
                          <span className="flex items-center gap-3">
                            Next
                            <ArrowRightIcon size={16} />
                          </span>
                        ) : (
                          <span className="flex items-center gap-3">
                            <CalendarIcon size={16} />
                            {submitCta.idle}
                          </span>
                        )}
                      </button>
                      <p className="mt-5 text-center text-[0.7rem] font-normal tracking-[0.02em] text-[var(--fg-muted)]">
                        {submitCta.footnote}
                      </p>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
