/** Wire shape returned by the API and used by the attractions manager. */
export interface AttractionData {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  mapUrl: string;
  rating: number;
  travelTime: string;
  displayOrder: number;
  featured: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Raw row as stored in Firestore. */
export interface AttractionRow {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  mapUrl: string;
  rating: number;
  travelTime: string;
  displayOrder: number;
  featured: boolean;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttractionFilters {
  search?: string;
  visibility?: "visible" | "hidden";
  featured?: "featured" | "regular";
  page?: number;
  pageSize?: number;
}

export interface AttractionListResult {
  items: AttractionData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
