/** Wire shape returned by the API and used by the reviews manager. */
export interface ReviewData {
  id: number;
  name: string;
  imageUrl: string;
  rating: number;
  text: string;
  reviewDate: string;
  displayOrder: number;
  featured: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Raw row as stored in Firestore. */
export interface ReviewRow {
  id: number;
  name: string;
  imageUrl: string;
  rating: number;
  text: string;
  reviewDate: string;
  displayOrder: number;
  featured: boolean;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewFilters {
  search?: string;
  visibility?: "visible" | "hidden";
  featured?: "featured" | "regular";
  rating?: number;
  page?: number;
  pageSize?: number;
}

export interface ReviewListResult {
  items: ReviewData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
