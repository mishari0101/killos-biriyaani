import { MailIcon } from "@/components/ui/icons";
import { ContactMessageManager } from "@/components/admin/contact-messages/contact-message-manager";
import { ContactMessageSkeleton } from "@/components/admin/contact-messages/contact-message-skeleton";
import { listContactMessages } from "@/lib/contact-messages/service";
import { Suspense } from "react";

export const metadata = {
  title: "Contact — Admin Studio",
};

export const dynamic = "force-dynamic";

async function ContactContent() {
  const initial = await listContactMessages({ page: 1, pageSize: 100 });
  return <ContactMessageManager initial={initial} />;
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8">
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
          Admin Studio
        </p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-[var(--admin-fg)] sm:text-3xl">
            Contact Inbox
          </h1>
          <span className="admin-chip hidden sm:inline-flex">
            <MailIcon size={13} />
            Live from the website
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[0.9rem] text-[var(--admin-fg-soft)]">
          Every enquiry sent from the contact form on the site lands here instantly. Read,
          reply, close or flag spam, add internal notes, and keep every lead organised.
        </p>
      </header>

      <Suspense fallback={<ContactMessageSkeleton />}>
        <ContactContent />
      </Suspense>
    </div>
  );
}
