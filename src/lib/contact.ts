import type { ReservationInput } from "@/lib/content/contact";

export const MAX_GUESTS = 50;
export const MAX_REQUEST = 500;

export type ReservationFieldKey =
  | "name"
  | "phone"
  | "guests"
  | "date"
  | "time"
  | "occasion"
  | "request";

export type ReservationFormValues = Record<ReservationFieldKey, string>;

export function todayLocalISO(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

export function normalizePhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 12) return null;
  return digits;
}

export function validateReservationFields(
  values: ReservationFormValues
): Partial<Record<ReservationFieldKey, string>> {
  const errors: Partial<Record<ReservationFieldKey, string>> = {};

  const name = values.name.trim();
  if (name.length < 2) errors.name = "Please enter your full name.";
  else if (name.length > 80) errors.name = "Keep your name under 80 characters.";

  const digits = values.phone.replace(/\D/g, "");
  if (!values.phone.trim()) errors.phone = "Please enter your phone number.";
  else if (digits.length < 9 || digits.length > 12)
    errors.phone = "Please enter a valid phone number.";

  const guests = Number(values.guests);
  if (!values.guests) errors.guests = "Please select the number of guests.";
  else if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS)
    errors.guests = `Please select between 1 and ${MAX_GUESTS} guests.`;

  if (!values.date) errors.date = "Please choose a date.";
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date))
    errors.date = "Please choose a valid date.";
  else if (values.date < todayLocalISO())
    errors.date = "Please choose a future date.";

  if (!values.time) errors.time = "Please choose a time.";
  else if (!/^\d{2}:\d{2}$/.test(values.time))
    errors.time = "Please choose a valid time.";

  if (values.request.trim().length > MAX_REQUEST)
    errors.request = `Keep your request under ${MAX_REQUEST} characters.`;

  return errors;
}

export function toReservationPayload(
  values: ReservationFormValues
): ReservationInput {
  return {
    name: values.name.trim(),
    phone: normalizePhone(values.phone) ?? values.phone.replace(/\D/g, ""),
    guests: Number(values.guests),
    date: values.date,
    time: values.time,
    ...(values.occasion ? { occasion: values.occasion } : {}),
    ...(values.request.trim() ? { request: values.request.trim() } : {}),
  };
}

export function waHref(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  let intl = digits;
  if (digits.startsWith("00")) intl = digits.slice(2);
  else if (digits.startsWith("0")) intl = `94${digits.slice(1)}`;
  else if (digits.startsWith("7")) intl = `94${digits}`;
  const base = `https://wa.me/${intl}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export async function submitReservation(
  input: ReservationInput
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        error:
          typeof data.error === "string"
            ? data.error
            : "Something went wrong. Please try again.",
      };
    }
    return { ok: true };
  } catch (error) {
    console.error("[reservations]", error);
    return { ok: false, error: "Network error. Please try again." };
  }
}
