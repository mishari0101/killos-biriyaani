import { seedFaqs, type FaqItem } from "@/lib/content/faqs";
import { fetchJson } from "@/lib/fetch-json";

const rawPoll = Number(process.env.NEXT_PUBLIC_FAQS_POLL_MS ?? 60000);
export const FAQS_POLL_MS =
  Number.isFinite(rawPoll) && rawPoll >= 0 ? Math.floor(rawPoll) : 60000;

export function fetchFaqs(): Promise<FaqItem[]> {
  return fetchJson<FaqItem[]>(
    "/api/faqs",
    "faqs",
    seedFaqs,
    (data) => Array.isArray(data) && data.length > 0
  );
}
