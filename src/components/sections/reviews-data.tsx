import { seedReviews } from "@/lib/content/reviews";
import { listReviews } from "@/lib/reviews/service";
import type { ReviewData } from "@/lib/reviews/types";
import { Reviews, type SectionReviewItem } from "./reviews";

function toSectionItem(item: ReviewData): SectionReviewItem {
  return {
    id: String(item.id),
    name: item.name,
    rating: item.rating,
    date: item.reviewDate,
    text: item.text,
    image: item.imageUrl || undefined,
    pinned: item.featured,
  };
}

export async function ReviewsData() {
  let items: SectionReviewItem[];
  try {
    const result = await listReviews({ pageSize: 50 });
    const visible = result.items.filter((item) => item.visible);
    items = visible.length > 0 ? visible.map(toSectionItem) : seedReviews;
  } catch {
    items = seedReviews;
  }
  return <Reviews items={items} />;
}
