import { seedBranches, type BranchItem } from "@/lib/content/branches";
import { listBranches, rowToPublicBranch } from "@/lib/branches/service";
import { Branches } from "./branches";

export async function BranchesData() {
  let items: BranchItem[];
  try {
    const result = await listBranches({ pageSize: 50 });
    const visible = result.items.filter((item) => item.visible);
    items = visible.length > 0 ? visible.map(rowToPublicBranch) : seedBranches;
  } catch {
    items = seedBranches;
  }
  return <Branches items={items} />;
}
