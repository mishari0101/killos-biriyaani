import { menuCategories, menuItems } from "@/lib/content/menu";
import { listMenuCategories, listMenuItems } from "@/lib/menu/service";
import type { MenuItemData } from "@/lib/menu/types";
import { Menu, type SectionCategory, type SectionMenuItem } from "./menu";

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

function fallbackCategories(): SectionCategory[] {
  return menuCategories
    .filter((cat) => cat.id !== "all")
    .map((cat) => ({ id: cat.id, label: cat.label }));
}

export async function MenuData() {
  let items: SectionMenuItem[];
  let categories: SectionCategory[];
  try {
    const [result, categoryRows] = await Promise.all([
      listMenuItems({ pageSize: 50, sort: "order" }),
      listMenuCategories(),
    ]);
    items =
      result.items.length === 0
        ? menuItems
        : result.items.filter((item) => item.available).map(toSectionItem);

    if (result.items.length === 0) {
      categories = fallbackCategories();
    } else {
      const seen = new Set<string>();
      const pills: SectionCategory[] = [];
      for (const row of categoryRows) {
        const id = categoryToPillId(row.name);
        if (seen.has(id)) continue;
        seen.add(id);
        pills.push({ id, label: row.name });
      }
      for (const item of result.items) {
        if (!item.available) continue;
        const id = categoryToPillId(item.category);
        if (seen.has(id)) continue;
        seen.add(id);
        pills.push({ id, label: item.category });
      }
      categories = pills;
    }
  } catch {
    items = menuItems;
    categories = fallbackCategories();
  }
  return <Menu items={items} categories={categories} />;
}
