import { contactInfo } from "@/lib/content/contact";
import { listBranches, branchContactInfo } from "@/lib/branches/service";
import type { BranchContactInfo } from "@/lib/branches/types";
import { Contact } from "./contact";

const seedContactInfo: BranchContactInfo = {
  phones: [...contactInfo.phones],
  whatsapp: contactInfo.phones[0],
  whatsappMessage: contactInfo.whatsappMessage,
  email: "",
  addresses: [...contactInfo.addresses],
  hoursNote: contactInfo.hoursNote,
  hours: contactInfo.hours,
  openFromHour: contactInfo.openFromHour,
  openToHour: contactInfo.openToHour,
};

export async function ContactData() {
  let info: BranchContactInfo = seedContactInfo;
  try {
    const result = await listBranches({ pageSize: 50 });
    const visible = result.items.filter((item) => item.visible);
    if (visible.length > 0) {
      info = branchContactInfo(visible);
    }
  } catch {
    info = seedContactInfo;
  }
  return <Contact info={info} />;
}
