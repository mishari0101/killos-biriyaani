import { listBranches, branchContactInfo } from "@/lib/branches/service";
import { waHref } from "@/lib/contact";
import { contactInfo } from "@/lib/content/contact";
import { getSettingsSafe } from "@/lib/seo/public";
import { WhatsAppIcon } from "@/components/ui/icons";

/**
 * Floating WhatsApp chat button.
 *
 * Position is coordinated with .back-to-top so the two never overlap:
 *   mobile  — back-to-top: right 20 / bottom 152 → this sits below it
 *   desktop — back-to-top: right 28 / bottom 28  → this sits above it
 */
export async function FloatingWhatsApp() {
  let phone: string = contactInfo.phones[0];
  let message: string = contactInfo.whatsappMessage;

  try {
    const settings = await getSettingsSafe();
    const configured = settings?.whatsappNumber.trim();
    if (configured) phone = configured;
  } catch {
    /* fall through to content defaults */
  }

  try {
    const result = await listBranches({ pageSize: 50 });
    const visible = result.items.filter((item) => item.visible);
    if (visible.length > 0) {
      const info = branchContactInfo(visible);
      phone = info.whatsapp || info.phones[0];
      message = info.whatsappMessage;
    }
  } catch {
    /* keep resolved fallback number */
  }

  return (
    <a
      href={waHref(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-[88px] right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#1FAF58] text-white ring-1 ring-black/10 shadow-[0_10px_28px_-10px_rgba(31,175,88,0.6)] transition-all duration-300 ease-out hover:scale-105 hover:bg-[#24C463] hover:shadow-[0_16px_42px_-10px_rgba(31,175,88,0.85)] active:scale-95 lg:bottom-[96px] lg:right-7 lg:h-[52px] lg:w-[52px]"
    >
      <WhatsAppIcon size={22} />
    </a>
  );
}
