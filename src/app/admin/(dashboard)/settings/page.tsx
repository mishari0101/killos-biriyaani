import { SettingsIcon } from "@/components/ui/icons";
import { SettingsForm } from "@/components/admin/settings/settings-form";
import { SettingsSkeleton } from "@/components/admin/settings/settings-skeleton";
import { getSettings } from "@/lib/settings/service";
import { Suspense } from "react";

export const metadata = {
  title: "Settings — Admin Studio",
};

async function SettingsContent() {
  const settings = await getSettings();
  return <SettingsForm initialSettings={settings} />;
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
          Admin Studio
        </p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-[var(--admin-fg)] sm:text-3xl">
            Restaurant Settings
          </h1>
          <span className="admin-chip hidden sm:inline-flex">
            <SettingsIcon size={13} />
            Single source of truth
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[0.9rem] text-[var(--admin-fg-soft)]">
          Manage the essentials — identity, contact, hours, location and social links. Everything
          the public site shows starts here.
        </p>
      </header>

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
