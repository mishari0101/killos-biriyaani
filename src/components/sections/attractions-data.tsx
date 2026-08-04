import { seedAttractions } from "@/lib/content/attractions";
import { listAttractions } from "@/lib/attractions/service";
import type { AttractionData } from "@/lib/attractions/types";
import { Attractions, type SectionAttractionItem } from "./attractions";

function toSectionItem(item: AttractionData): SectionAttractionItem {
  return {
    id: String(item.id),
    name: item.name,
    description: item.description,
    rating: item.rating,
    travelTime: item.travelTime,
    image: item.imageUrl,
    mapUrl: item.mapUrl,
    featured: item.featured,
  };
}

export async function AttractionsData() {
  let items: SectionAttractionItem[];
  try {
    const result = await listAttractions({ pageSize: 50 });
    const visible = result.items.filter((item) => item.visible);
    items = visible.length > 0 ? visible.map(toSectionItem) : seedAttractions;
  } catch {
    items = seedAttractions;
  }
  return <Attractions items={items} />;
}
