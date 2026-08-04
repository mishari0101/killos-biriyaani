import { seedFaqs } from "@/lib/content/faqs";
import { listPublicFaqs } from "@/lib/faqs/service";

/** FAQPage structured data for Google rich results. Built from the same
    visible FAQs the accordion shows, so it never drifts from the site. */
export async function FaqJsonLd() {
  let items: { question: string; answer: string }[];
  try {
    const rows = await listPublicFaqs();
    items = rows.length ? rows : seedFaqs;
  } catch {
    items = seedFaqs;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}
