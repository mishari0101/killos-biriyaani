export interface FaqInput {
  question: string;
  answer: string;
  category: string;
  featured: boolean;
  visible: boolean;
  displayOrder: number;
}

export type FaqErrors = Partial<Record<keyof FaqInput, string>>;

/** Validate a FAQ payload. Returns a map of field → error message. */
export function validateFaq(data: FaqInput): FaqErrors {
  const errors: FaqErrors = {};

  if (!data.question.trim()) {
    errors.question = "Question is required.";
  } else if (data.question.trim().length > 300) {
    errors.question = "Must be 300 characters or fewer.";
  }

  if (!data.answer.trim()) {
    errors.answer = "Answer is required.";
  } else if (data.answer.trim().length > 4000) {
    errors.answer = "Must be 4000 characters or fewer.";
  }

  if (data.category.trim().length > 80) {
    errors.category = "Must be 80 characters or fewer.";
  }

  if (!Number.isInteger(data.displayOrder) || data.displayOrder < 0 || data.displayOrder > 9999) {
    errors.displayOrder = "Display order must be a whole number from 0–9999.";
  }

  return errors;
}
