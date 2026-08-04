import type { FaqModel } from "@/generated/prisma/models/Faq";

/** Wire shape returned by the API and used by the FAQ manager. */
export interface FaqData {
  id: number;
  question: string;
  answer: string;
  category: string;
  featured: boolean;
  visible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** Raw row as stored by Prisma. */
export type FaqRow = FaqModel;

export interface FaqFilters {
  search?: string;
  visibility?: "visible" | "hidden";
  featured?: "featured" | "regular";
}

export interface FaqListResult {
  items: FaqData[];
  total: number;
}
