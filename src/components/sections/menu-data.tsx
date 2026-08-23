import { menuCategories, menuItems } from "@/lib/content/menu";
import { listMenuCategories, listMenuItems } from "@/lib/menu/service";
import type { MenuItemData } from "@/lib/menu/types";
import { listBranches, branchContactInfo } from "@/lib/branches/service";
import { getSettingsSafe } from "@/lib/seo/public";
import { contactInfo } from "@/lib/content/contact";
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

/** Resolve the restaurant WhatsApp number with the same priority as the footer:
 *  branch WhatsApp → branch phone → Settings → content default. */
async function resolveWhatsAppPhone(): Promise<string> {
  let phone: string = contactInfo.phones[0];
  try {
    const settings = await getSettingsSafe();
    const configured = settings?.whatsappNumber.trim();
    if (configured) phone = configured;
  } catch {
    /* keep fallback */
  }
  try {
    const result = await listBranches({ pageSize: 50 });
    const visible = result.items.filter((item) => item.visible);
    if (visible.length > 0) {
      const info = branchContactInfo(visible);
      phone = info.whatsapp || info.phones[0];
    }
  } catch {
    /* keep resolved fallback */
  }
  return phone;
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
  const waPhone = await resolveWhatsAppPhone();
  return <Menu items={items} categories={categories} waPhone={waPhone} />;
}
