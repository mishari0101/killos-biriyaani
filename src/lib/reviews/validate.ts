import { isValidImageUrl } from "@/lib/gallery/validate";

export interface ReviewInput {
  name: string;
  imageUrl: string;
  rating: number;
  text: string;
  reviewDate: string;
  displayOrder: number;
  featured: boolean;
  visible: boolean;
}

export type ReviewErrors = Partial<Record<keyof ReviewInput, string>>;

/** A rating is a whole number from 1–5 stars. */
export function isValidRating(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

/** Validate a review payload. Returns a map of field → error message. */
export function validateReview(data: ReviewInput): ReviewErrors {
  const errors: ReviewErrors = {};

  if (!data.name.trim()) {
    errors.name = "Name is required.";
  } else if (data.name.trim().length > 120) {
    errors.name = "Must be 120 characters or fewer.";
  }

  if (data.imageUrl.trim() && !isValidImageUrl(data.imageUrl)) {
    errors.imageUrl = "Enter a valid image URL.";
  }

  if (!isValidRating(data.rating)) {
    errors.rating = "Rating must be a whole number of stars from 1–5.";
  }

  if (!data.text.trim()) {
    errors.text = "Review text is required.";
  } else if (data.text.trim().length > 5000) {
    errors.text = "Must be 5000 characters or fewer.";
  }

  if (data.reviewDate.trim().length > 120) {
    errors.reviewDate = "Must be 120 characters or fewer.";
  }

  if (!Number.isInteger(data.displayOrder) || data.displayOrder < 0 || data.displayOrder > 9999) {
    errors.displayOrder = "Display order must be a whole number from 0–9999.";
  }

  return errors;
}
