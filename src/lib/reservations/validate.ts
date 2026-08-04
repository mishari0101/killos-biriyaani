import { isValidEmail, isValidPhone, isValidTime } from "@/lib/settings/validate";
import { isReservationStatus, type ReservationStatus } from "./types";

export const MAX_GUESTS = 50;
export const MAX_REQUEST = 500;
export const MAX_NOTES = 2000;

export interface ReservationInput {
  name: string;
  phone: string;
  email: string;
  branch: string;
  guests: number;
  date: string;
  time: string;
  occasion: string;
  request: string;
}

export type ReservationErrors = Partial<Record<keyof ReservationInput, string>>;

export function todayLocalISO(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

/** Reduce any phone input to digits so lookups and duplicates match reliably. */
export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

/** Validate a reservation payload. Returns a map of field → error message. */
export function validateReservation(data: ReservationInput): ReservationErrors {
  const errors: ReservationErrors = {};

  const name = data.name.trim();
  if (!name) {
    errors.name = "Please enter your full name.";
  } else if (name.length < 2) {
    errors.name = "Your name must be at least 2 characters.";
  } else if (name.length > 120) {
    errors.name = "Keep your name under 120 characters.";
  }

  const phone = normalizePhone(data.phone);
  if (!data.phone.trim()) {
    errors.phone = "Please enter your phone number.";
  } else if (phone.length < 9 || phone.length > 12 || !isValidPhone(data.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (data.email.trim()) {
    if (!isValidEmail(data.email)) {
      errors.email = "Please enter a valid email address.";
    } else if (data.email.trim().length > 160) {
      errors.email = "Keep your email under 160 characters.";
    }
  }

  if (data.branch.trim().length > 160) {
    errors.branch = "Keep the branch under 160 characters.";
  }

  if (!Number.isInteger(data.guests) || data.guests < 1 || data.guests > MAX_GUESTS) {
    errors.guests = `Please select between 1 and ${MAX_GUESTS} guests.`;
  }

  if (!data.date.trim()) {
    errors.date = "Please choose a date.";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.date = "Please choose a valid date.";
  } else if (data.date < todayLocalISO()) {
    errors.date = "Please choose a future date.";
  }

  if (!data.time.trim()) {
    errors.time = "Please choose a time.";
  } else if (!isValidTime(data.time)) {
    errors.time = "Please choose a valid time.";
  }

  if (data.occasion.trim().length > 80) {
    errors.occasion = "Keep the occasion under 80 characters.";
  }

  if (data.request.trim().length > MAX_REQUEST) {
    errors.request = `Keep your request under ${MAX_REQUEST} characters.`;
  }

  return errors;
}

export function isReservationStatusOrEmpty(value: string): boolean {
  if (!value.trim()) return true;
  return isReservationStatus(value);
}

export type { ReservationStatus };
