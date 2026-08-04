import type { BranchModel } from "@/generated/prisma/models/Branch";
import type { DayHours } from "@/lib/settings/types";

/** Wire shape returned by the API and used by the branches manager. */
export interface BranchData {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
  address: string;
  mapsUrl: string;
  latitude: number;
  longitude: number;
  primaryPhone: string;
  secondaryPhone: string;
  whatsapp: string;
  email: string;
  hours: DayHours[];
  description: string;
  displayOrder: number;
  featured: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Raw row as stored by Prisma. */
export type BranchRow = BranchModel;

export interface BranchFilters {
  search?: string;
  visibility?: "visible" | "hidden";
  featured?: "featured" | "regular";
  page?: number;
  pageSize?: number;
}

export interface BranchListResult {
  items: BranchData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Derived contact details shown in the contact section and footer. */
export interface BranchContactInfo {
  phones: string[];
  whatsapp: string;
  whatsappMessage: string;
  email: string;
  addresses: string[];
  hoursNote: string;
  hours: string;
  openFromHour: number;
  openToHour: number;
}
