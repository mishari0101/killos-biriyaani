/** Wire shape returned by the API and used by the gallery manager. */
export interface GalleryItemData {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  aspect: string;
  displayOrder: number;
  featured: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Raw row as stored in Firestore. */
export interface GalleryItemRow {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  aspect: string;
  displayOrder: number;
  featured: boolean;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GalleryFilters {
  search?: string;
  visibility?: "visible" | "hidden";
  featured?: "featured" | "regular";
  page?: number;
  pageSize?: number;
}

export interface GalleryListResult {
  items: GalleryItemData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
