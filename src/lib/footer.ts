import { seedFooter, type FooterContent } from "@/lib/content/footer";
import { fetchJson } from "@/lib/fetch-json";

const rawPoll = Number(process.env.NEXT_PUBLIC_FOOTER_POLL_MS ?? 60000);
export const FOOTER_POLL_MS =
  Number.isFinite(rawPoll) && rawPoll >= 0 ? Math.floor(rawPoll) : 60000;

export function fetchFooter(): Promise<FooterContent> {
  return fetchJson<FooterContent>(
    "/api/footer",
    "footer",
    seedFooter,
    (data) => !!data && typeof data === "object" && !!data.name
  );
}
