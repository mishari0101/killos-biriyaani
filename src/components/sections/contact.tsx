"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";
import { DayPicker } from "react-day-picker";
import {
  contact,
  enquiryForm,
  enquirySuccess,
  formLabels,
  infoCard,
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
  waHref,
  type EnquiryFieldKey,
  type EnquiryFormValues,
  type ReservationFieldKey,
  type ReservationFormValues,
} from "@/lib/contact";
import { directionsUrl, telHref } from "@/lib/branches";
import type { BranchContactInfo } from "@/lib/branches/types";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";

const STAGGER_MS = 120;
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

/* Current local hour, refreshed each minute. A tiny external store caches the
   snapshot so getSnapshot stays stable between ticks — otherwise
   useSyncExternalStore would force a re-render on every check. The server
   snapshot returns 0 (null sentinel) so the Open/Closed badge hydrates without
   mismatches. */
const hourListeners = new Set<() => void>();
let hourSnapshot = 0;
let hourTimer: number | null = null;

function subscribeHour(onChange: () => void): () => void {
  hourListeners.add(onChange);
  if (hourListeners.size === 1) {
    hourSnapshot = Date.now();
    hourTimer = window.setInterval(() => {
      hourSnapshot = Date.now();
      hourListeners.forEach((listener) => listener());
    }, 60_000);
  }
  return () => {
    hourListeners.delete(onChange);
    if (hourListeners.size === 0 && hourTimer !== null) {
      window.clearInterval(hourTimer);
      hourTimer = null;
    }
  };
}

function getHourSnapshot(): number {
  return hourSnapshot;
}

function useCurrentHour(): number | null {
  const now = useSyncExternalStore(subscribeHour, getHourSnapshot, () => 0);
  return now === 0 ? null : new Date(now).getHours();
}

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

/* ------------------------------ Field ------------------------------ */

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
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  const className = `contact-input ${
    error ? "contact-input-error" : ""
  } ${multiline ? "contact-input-area" : ""}`;

  const common = {
    id,
    className,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => {
      setFocused(false);
      onBlur();
    },
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
        <label
          htmlFor={id}
          className={`contact-label ${floated ? "contact-label-float" : ""}`}
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
          className={`contact-input contact-trigger ${
            open ? "contact-trigger-open" : ""
          } ${error ? "contact-input-error" : ""}`}
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
            className={`contact-trigger-value ${
              value === "" && focused ? "contact-trigger-placeholder" : ""
            }`}
          >
            {value ? formatDate(value) : focused || open ? "Select Date" : ""}
          </span>
        </button>
        <label
          htmlFor="date"
          className={`contact-label ${floated ? "contact-label-float" : ""}`}
        >
          {label}
          {required && <span className="text-[var(--brand-cta)]"> *</span>}
        </label>
        <span className="contact-input-icon" aria-hidden="true">
          <CalendarIcon size={15} />
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
          className={`contact-input contact-trigger ${
            open ? "contact-trigger-open" : ""
          } ${error ? "contact-input-error" : ""}`}
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
            className={`contact-trigger-value ${
              value === "" && focused ? "contact-trigger-placeholder" : ""
            }`}
          >
            {value ? formatTime(value) : focused || open ? "Select Time" : ""}
          </span>
        </button>
        <label
          htmlFor="time"
          className={`contact-label ${floated ? "contact-label-float" : ""}`}
        >
          {label}
          {required && <span className="text-[var(--brand-cta)]"> *</span>}
        </label>
        <span className="contact-input-icon" aria-hidden="true">
          <ClockIcon size={15} />
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
          className={`contact-input appearance-none pr-10 ${
            error ? "contact-input-error" : ""
          }`}
        >
          <option value="" disabled hidden />
          {GUEST_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "Guest" : "Guests"}
            </option>
          ))}
        </select>
        <label
          htmlFor="guests"
          className={`contact-label ${floated ? "contact-label-float" : ""}`}
        >
          {formLabels.guests}
          <span className="text-[var(--brand-cta)]"> *</span>
        </label>
        <ChevronDownIcon
          size={15}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--contact-label)]"
        />
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
          className="contact-input appearance-none pr-10"
        >
          <option value="" disabled hidden />
          {occasionOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <label
          htmlFor="occasion"
          className={`contact-label ${floated ? "contact-label-float" : ""}`}
        >
          {formLabels.occasion}
        </label>
        <ChevronDownIcon
          size={15}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--contact-label)]"
        />
      </div>
      <p id="occasion-error" className="contact-field-error" />
    </div>
  );
}

/* --------------------- Restaurant info rows --------------------- */

function ActionLink({
  href,
  icon: Icon,
  external,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="btn btn-outline contact-action h-10 w-full sm:w-auto"
    >
      <Icon size={14} />
      <span>{children}</span>
      <ArrowRightIcon size={14} className="contact-action-arrow" />
    </a>
  );
}

function InfoRow({
  icon: Icon,
  title,
  children,
  action,
  index,
}: {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  index: number;
}) {
  return (
    <div
      className="group contact-item border-t border-[var(--hairline)] py-5 first:border-t-0 first:pt-0"
      style={{ "--d": `${320 + index * STAGGER_MS}ms` } as React.CSSProperties}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--accent-soft)] bg-[var(--accent-soft)] text-[var(--accent)] transition-transform duration-300 ease-out group-hover:scale-105">
          <Icon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-[var(--fg-muted)] transition-colors duration-300 ease-out group-hover:text-[var(--accent)]">
            {title}
          </h4>
          <div className="mt-1 text-[0.9rem] font-medium leading-snug text-[var(--fg)]">
            {children}
          </div>
        </div>
        {action && <div className="shrink-0 sm:ml-auto">{action}</div>}
      </div>
    </div>
  );
}

function OpenStatusBadge({ open }: { open: boolean }) {
  return (
    <span
      className={`inline-flex h-[30px] items-center gap-2 rounded-full border px-3.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-500 ${
        open
          ? "border-[rgba(37,211,102,0.45)] bg-[rgba(37,211,102,0.12)] text-[#1e9c52]"
          : "border-[rgba(192,57,43,0.4)] bg-[rgba(192,57,43,0.1)] text-[var(--brand-cta)]"
      }`}
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${
            open ? "animate-ping bg-[#25d366] opacity-60" : ""
          }`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            open ? "bg-[#25d366]" : "bg-[var(--brand-cta)]"
          }`}
        />
      </span>
      {open ? "Open Now" : "Closed"}
    </span>
  );
}

/* --------------------------- Success card --------------------------- */

function SuccessCard({
  info,
  title,
  numberLabel,
  message,
  number,
  onReset,
}: {
  info: BranchContactInfo;
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
        <a
          href={telHref(info.phones[0])}
          className="btn btn-brand btn-lg w-full"
        >
          <PhoneIcon size={15} />
          Call Now
        </a>
        <a
          href={waHref(info.whatsapp || info.phones[0], info.whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-wa btn-lg w-full"
        >
          <WhatsAppIcon size={15} />
          WhatsApp
        </a>
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
      <div className="space-y-4 sm:space-y-5">
        <div className="grid min-[360px]:grid-cols-2 gap-x-3 gap-y-4">
          <Field
            id="name"
            label={enquiryForm.name}
            value={values.name}
            onChange={(v) => setField("name", v)}
            onBlur={() => blurField("name")}
            error={touched.name ? errors.name : undefined}
            required
            autoComplete="name"
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
          />
        </div>
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
        className="btn btn-brand btn-lg mt-6 w-full disabled:cursor-not-allowed disabled:opacity-75"
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
      <p className="mt-4 text-center text-[0.7rem] font-normal tracking-[0.02em] text-[var(--fg-muted)]">
        {enquiryForm.footnote}
      </p>
    </form>
  );
}

/* ------------------------------- Section ------------------------------- */

export function Contact({ info }: { info: BranchContactInfo }) {
  const sectionRef = useRef<HTMLElement>(null);
  const formWrapRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const enqFormRef = useRef<HTMLFormElement>(null);
  const enqSubmitBtnRef = useRef<HTMLButtonElement>(null);

  const [mode, setMode] = useState<"reservation" | "message">("reservation");
  const [inView, setInView] = useState(false);
  const [formInView, setFormInView] = useState(false);
  const [submitInView, setSubmitInView] = useState(false);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<ReservationFieldKey, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<ReservationFieldKey, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState("");
  const [reservationNumber, setReservationNumber] = useState<string | null>(null);
  const [enqStatus, setEnqStatus] = useState<EnquiryStatus>("idle");
  const [enqNumber, setEnqNumber] = useState<string | null>(null);

  const hour = useCurrentHour();
  const isOpen =
    hour === null
      ? null
      : hour >= info.openFromHour && hour < info.openToHour;

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
    const el = formWrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setFormInView(entry.isIntersecting),
      { rootMargin: "0px 0px -25% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el =
      mode === "message" ? enqSubmitBtnRef.current : submitBtnRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setSubmitInView(entry.isIntersecting),
      { rootMargin: "0px 0px -40px 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [status, enqStatus, mode]);

  const showSticky =
    formInView &&
    !submitInView &&
    status !== "success" &&
    status !== "submitting" &&
    enqStatus !== "success" &&
    enqStatus !== "submitting";

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

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
  };

  const handleEnquiryReset = () => {
    setMode("message");
    setEnqStatus("idle");
    setEnqNumber(null);
  };

  const switchMode = (next: "reservation" | "message") => {
    setMode(next);
    setSubmitInView(false);
    setEnqNumber(null);
    setEnqStatus("idle");
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className={`relative scroll-mt-24 bg-[var(--contact-bg)] pt-24 pb-32 lg:pt-36 lg:pb-40 ${
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
            className="contact-item mt-6 text-[clamp(2.4rem,5vw,3.6rem)] font-bold leading-[1.08] tracking-[0.01em] text-[var(--fg)]"
            style={
              { fontFamily: "var(--font-serif)", "--d": "120ms" } as React.CSSProperties
            }
          >
            {contact.titleA}
            <em className="mt-1 block italic text-[var(--accent)]">
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

        <div className="mt-14 grid gap-6 lg:mt-16 lg:grid-cols-[minmax(0,3.5fr)_minmax(0,6.5fr)] lg:gap-8">
          {/* ---- Left: restaurant information ---- */}
          <div
            className="contact-item rounded-[28px] border border-[var(--contact-card-border)] bg-[var(--contact-card-bg)] p-7 shadow-[var(--contact-card-shadow)] backdrop-blur-[16px] hover:shadow-[var(--contact-card-shadow-hover)] sm:p-8"
            style={{ "--d": "320ms" } as React.CSSProperties}
          >
            <div>
              <h3
                className="text-[1.1rem] font-bold leading-snug text-[var(--fg)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {infoCard.title}
              </h3>
              <p className="mt-2 text-[0.82rem] font-normal leading-[1.7] text-[var(--fg-soft)]">
                {infoCard.description}
              </p>
            </div>

            <div className="mt-5">
              <InfoRow
                icon={PhoneIcon}
                title="Call Us"
                index={0}
                action={
                  <ActionLink
                    href={telHref(info.phones[0])}
                    icon={PhoneIcon}
                  >
                    Call Now
                  </ActionLink>
                }
              >
                <div className="space-y-0.5">
                  {info.phones.map((phone) => (
                    <p key={phone}>{phone}</p>
                  ))}
                </div>
              </InfoRow>

              <InfoRow
                icon={WhatsAppIcon}
                title="WhatsApp"
                index={1}
                action={
                  <ActionLink
                    href={waHref(info.whatsapp || info.phones[0], info.whatsappMessage)}
                    icon={WhatsAppIcon}
                    external
                  >
                    Open WhatsApp
                  </ActionLink>
                }
              >
                Chat with us instantly.
              </InfoRow>

              <InfoRow
                icon={MapPinIcon}
                title="Visit Us"
                index={2}
                action={
                  <ActionLink
                    href={directionsUrl({
                      address: info.addresses[0],
                    } as Parameters<typeof directionsUrl>[0])}
                    icon={MapPinIcon}
                    external
                  >
                    Get Directions
                  </ActionLink>
                }
              >
                <div className="space-y-0.5">
                  {info.addresses.map((address) => (
                    <p key={address}>{address}</p>
                  ))}
                </div>
              </InfoRow>

              <InfoRow
                icon={ClockIcon}
                title="Opening Hours"
                index={3}
                action={
                  isOpen === null
                    ? null
                    : <OpenStatusBadge open={isOpen} />
                }
              >
                <div>
                  <p>{info.hoursNote}</p>
                  <p className="mt-0.5 text-[0.78rem] font-normal text-[var(--fg-muted)]">
                    {info.hours}
                  </p>
                </div>
              </InfoRow>
            </div>
          </div>

          {/* ---- Right: reservation form ---- */}
          <div
            id="reservation"
            ref={formWrapRef}
            className="contact-item scroll-mt-24 rounded-[28px] border border-[var(--contact-card-border)] bg-[var(--contact-card-bg)] p-6 shadow-[var(--contact-card-shadow)] backdrop-blur-[16px] sm:p-8 lg:p-10"
            style={{ "--d": "700ms" } as React.CSSProperties}
          >
            {mode === "message" && enqStatus === "success" ? (
              <SuccessCard
                info={info}
                title={enquirySuccess.title}
                numberLabel={enquirySuccess.numberLabel}
                message={enquirySuccess.message}
                number={enqNumber}
                onReset={handleEnquiryReset}
              />
            ) : status === "success" ? (
              <SuccessCard
                info={info}
                title={success.title}
                numberLabel={success.numberLabel}
                message={success.message}
                number={reservationNumber}
                onReset={handleReset}
              />
            ) : (
              <>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div
                    role="tablist"
                    aria-label="Contact form"
                    className="flex w-full max-w-[320px] rounded-full border border-[var(--contact-card-border)] bg-[var(--contact-tabs-bg)] p-1"
                  >
                    <button
                      type="button"
                      role="tab"
                      id="tab-book"
                      aria-selected={mode === "reservation"}
                      aria-controls="panel-book"
                      onClick={() => switchMode("reservation")}
                      className={`flex-1 rounded-full px-4 py-2 text-[0.78rem] font-semibold tracking-[0.03em] transition-colors duration-200 ${
                        mode === "reservation"
                          ? "bg-[var(--contact-tabs-active-bg)] text-[var(--contact-tabs-active-fg)] shadow-[var(--contact-tabs-shadow)]"
                          : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <CalendarIcon size={14} />
                        Reserve a Table
                      </span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      id="tab-message"
                      aria-selected={mode === "message"}
                      aria-controls="panel-message"
                      onClick={() => switchMode("message")}
                      className={`flex-1 rounded-full px-4 py-2 text-[0.78rem] font-semibold tracking-[0.03em] transition-colors duration-200 ${
                        mode === "message"
                          ? "bg-[var(--contact-tabs-active-bg)] text-[var(--contact-tabs-active-fg)] shadow-[var(--contact-tabs-shadow)]"
                          : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <MailIcon size={14} />
                        Send a Message
                      </span>
                    </button>
                  </div>
                  <span className="hidden shrink-0 self-start rounded-full border border-[var(--contact-card-border)] bg-[var(--accent-soft)] px-3.5 py-1.5 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-[var(--accent)] sm:inline-flex">
                    Fast &amp; Easy
                  </span>
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
                      <div className="space-y-4 sm:space-y-5">
                        <Field
                          id="name"
                          label={formLabels.name}
                          value={values.name}
                          onChange={(v) => setField("name", v)}
                          onBlur={() => blurField("name")}
                          error={touched.name ? errors.name : undefined}
                          required
                          autoComplete="name"
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
                        />
                        <div className="grid min-[360px]:grid-cols-2 gap-x-3 gap-y-4">
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
                        </div>
                        <div className="grid min-[360px]:grid-cols-2 gap-x-3 gap-y-4">
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
                        className="btn btn-brand btn-lg mt-6 w-full disabled:cursor-not-allowed disabled:opacity-75"
                      >
                        {status === "submitting" ? (
                          <span className="flex items-center gap-3">
                            <span
                              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                              aria-hidden="true"
                            />
                            {submitCta.loading}
                          </span>
                        ) : (
                          <span className="flex items-center gap-3">
                            <CalendarIcon size={16} />
                            {submitCta.idle}
                          </span>
                        )}
                      </button>
                      <p className="mt-4 text-center text-[0.7rem] font-normal tracking-[0.02em] text-[var(--fg-muted)]">
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

      {/* ---- Sticky mobile Reserve bar ---- */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-[var(--contact-sticky-border)] bg-[var(--contact-sticky-bg)] py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-[18px] backdrop-saturate-150 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          showSticky
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-4">
          <button
            type="button"
            onClick={() => {
              if (mode === "message") {
                enqFormRef.current?.requestSubmit();
              } else {
                formRef.current?.requestSubmit();
              }
            }}
            className="btn btn-brand btn-lg w-full"
          >
            {mode === "message" ? (
              <>
                <MailIcon size={16} />
                Send Message
              </>
            ) : (
              <>
                <CalendarIcon size={16} />
                Reserve Table
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
