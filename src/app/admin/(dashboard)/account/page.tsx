import { UserIcon } from "@/components/ui/icons";
import { AccountSettingsForm } from "@/components/admin/account/account-settings-form";
import { SettingsSkeleton } from "@/components/admin/settings/settings-skeleton";
import { getAdminAccount } from "@/lib/auth/service";
import { Suspense } from "react";

export const metadata = {
  title: "Account — Admin Studio",
};

async function AccountContent() {
  const account = await getAdminAccount();
  return (
    <AccountSettingsForm
      initialName={account.name}
      initialEmail={account.email}
      lastLoginAt={account.lastLoginAt?.toISOString() ?? null}
    />
  );
}

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
          Admin Studio
        </p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-[var(--admin-fg)] sm:text-3xl">
            Account Settings
          </h1>
          <span className="admin-chip hidden sm:inline-flex">
            <UserIcon size={13} />
            Single owner
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[0.9rem] text-[var(--admin-fg-soft)]">
          Your sign-in profile and security — display name, admin email, password and
          current session.
        </p>
      </header>

      <Suspense fallback={<SettingsSkeleton />}>
        <AccountContent />
      </Suspense>
    </div>
  );
}
