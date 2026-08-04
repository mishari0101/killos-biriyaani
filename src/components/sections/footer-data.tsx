import { listBranches, branchContactInfo } from "@/lib/branches/service";
import { waHref } from "@/lib/contact";
import { Footer, type BranchFooterContact } from "./footer";

export async function FooterData() {
  let branchContact: BranchFooterContact | undefined;
  try {
    const result = await listBranches({ pageSize: 50 });
    const visible = result.items.filter((item) => item.visible);
    if (visible.length > 0) {
      const info = branchContactInfo(visible);
      branchContact = {
        phones: info.phones,
        hours: info.hours,
        hoursNote: info.hoursNote,
        locations: info.addresses,
        whatsappHref: waHref(info.whatsapp || info.phones[0], info.whatsappMessage),
      };
    }
  } catch {
    branchContact = undefined;
  }
  return <Footer branchContact={branchContact} />;
}
