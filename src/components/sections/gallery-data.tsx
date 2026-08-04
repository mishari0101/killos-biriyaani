import { galleryItems } from "@/lib/content/gallery";
import { listGalleryItems } from "@/lib/gallery/service";
import type { GalleryItemData } from "@/lib/gallery/types";
import { Gallery, type SectionGalleryItem } from "./gallery";

function toSectionItem(item: GalleryItemData): SectionGalleryItem {
  return {
    id: String(item.id),
    label: item.title,
    caption: item.description,
    aspect: item.aspect,
    image: item.imageUrl,
  };
}

export async function GalleryData() {
  let items: SectionGalleryItem[];
  try {
    const result = await listGalleryItems({ pageSize: 50 });
    const visible = result.items.filter((item) => item.visible);
    items = visible.length > 0 ? visible.map(toSectionItem) : galleryItems;
  } catch {
    items = galleryItems;
  }
  return <Gallery items={items} />;
}
