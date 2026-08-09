import { seedFaqs } from "@/lib/content/faqs";

/** FAQPage structured data for Google rich results, built from the same static
    FAQs the accordion shows, so it never drifts from the site. */
export function FaqJsonLd() {
  const items = seedFaqs;

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
