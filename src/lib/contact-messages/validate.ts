import { isValidEmail, isValidPhone } from "@/lib/settings/validate";
import { isContactMessageStatus, type ContactMessageStatus } from "./types";

export const MAX_SUBJECT = 200;
export const MAX_MESSAGE = 2000;
export const MIN_MESSAGE = 10;
export const MAX_NOTES = 2000;
export const MAX_BRANCH = 160;

/** How long an identical submission (same phone + message) is treated as a
 * duplicate, so spam or double-taps never create two inbox entries. */
export const DUPLICATE_WINDOW_MINUTES = 15;

export interface ContactMessageInput {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  branch: string;
}

export type ContactMessageErrors = Partial<Record<keyof ContactMessageInput, string>>;

/** Reduce any phone input to digits so lookups and duplicates match reliably. */
export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

/** Validate a contact message payload. Returns a map of field → error message. */
export function validateContactMessage(data: ContactMessageInput): ContactMessageErrors {
  const errors: ContactMessageErrors = {};

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

  const subject = data.subject.trim();
  if (!subject) {
    errors.subject = "Please add a subject.";
  } else if (subject.length > MAX_SUBJECT) {
    errors.subject = `Keep your subject under ${MAX_SUBJECT} characters.`;
  }

  const message = data.message.trim();
  if (!message) {
    errors.message = "Please enter your message.";
  } else if (message.length < MIN_MESSAGE) {
    errors.message = `Your message should be at least ${MIN_MESSAGE} characters.`;
  } else if (message.length > MAX_MESSAGE) {
    errors.message = `Keep your message under ${MAX_MESSAGE} characters.`;
  }

  if (data.branch.trim().length > MAX_BRANCH) {
    errors.branch = `Keep the branch under ${MAX_BRANCH} characters.`;
  }

  return errors;
}

export function isContactMessageStatusOrEmpty(value: string): boolean {
  if (!value.trim()) return true;
  return isContactMessageStatus(value);
}

export type { ContactMessageStatus };
