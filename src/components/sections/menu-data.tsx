import { menuItems } from "@/lib/content/menu";
import { listMenuItems } from "@/lib/menu/service";
import type { MenuItemData } from "@/lib/menu/types";
import { Menu, type SectionMenuItem } from "./menu";

function categoryToPillId(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatPrice(price: number): string {
  return `Rs ${price.toLocaleString("en-US")}`;
}

function toSectionItem(item: MenuItemData): SectionMenuItem {
  return {
    id: String(item.id),
    name: item.name,
    description: item.description,
    price: formatPrice(item.price),
    category: categoryToPillId(item.category),
    image: item.imageUrl,
  };
}

export async function MenuData() {
  let items: SectionMenuItem[];
  try {
    const result = await listMenuItems({ pageSize: 50, sort: "order" });
    items =
      result.items.length === 0
        ? menuItems
        : result.items.filter((item) => item.available).map(toSectionItem);
  } catch {
    items = menuItems;
  }
  return <Menu items={items} />;
}
