import { UsersIcon } from "@/components/ui/icons";
import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const metadata = {
  title: "Users — Admin Studio",
};

export default function UsersPage() {
  return (
    <PlaceholderPage
      title="Users"
      description="Admin accounts, roles and access across the studio."
      icon={UsersIcon}
      bullets={["Team accounts", "Roles & permissions", "Audit log"]}
      planned
    />
  );
}
