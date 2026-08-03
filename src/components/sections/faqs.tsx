"use client";

import { useEffect, useRef, useState } from "react";
import { faqs, seedFaqs, type FaqItem } from "@/lib/content/faqs";
import { fetchFaqs, FAQS_POLL_MS } from "@/lib/faqs";

const STAGGER_MS = 80;

function AccordionIcon({ open }: { open: boolean }) {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--faq-icon-border)] bg-[var(--faq-icon-bg)] text-[var(--faq-icon-fg)]"
      aria-hidden="true"
    >
      <span className="relative block h-3 w-3">
        <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 rounded-full bg-current" />
        <span
          className={`faq-icon-v absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 rounded-full bg-current ${
            open ? "" : ""
          }`}
        />
      </span>
    </span>
  );
}

function FaqCard({
  faq,
  index,
  open,
  onToggle,
}: {
  faq: FaqItem;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = `faq-panel-${faq.id}`;
  const buttonId = `faq-button-${faq.id}`;

  return (
    <div
      className={`faq-item group overflow-hidden rounded-[24px] border border-[var(--faq-card-border)] bg-[var(--faq-card-bg)] shadow-[var(--faq-card-shadow)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[var(--faq-card-border-hover)] hover:shadow-[var(--faq-card-shadow-hover)] ${
        open ? "faq-open" : ""
      }`}
      style={{ "--d": `${index * STAGGER_MS}ms` } as React.CSSProperties}
    >
      <button
        id={buttonId}
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-14 w-full items-center justify-between gap-5 px-6 py-5 text-left sm:px-8"
      >
        <h3
          className="text-[1.02rem] font-semibold leading-snug text-[var(--fg)]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {faq.question}
        </h3>
        <AccordionIcon open={open} />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="faq-answer"
      >
        <div className="faq-answer-inner">
          <p className="px-6 pb-7 text-[0.95rem] font-normal leading-[1.85] text-[var(--fg-soft)] sm:px-8">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Faqs() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [items, setItems] = useState<FaqItem[]>(seedFaqs);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const next = await fetchFaqs();
      if (alive) setItems(next);
    };
    load();
    if (FAQS_POLL_MS > 0) {
      const id = setInterval(load, FAQS_POLL_MS);
      return () => {
        alive = false;
        clearInterval(id);
      };
    }
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = (index: number) =>
    setOpenIndex((prev) => (prev === index ? null : index));

  return (
    <section
      id="faq"
      ref={sectionRef}
      className={`relative scroll-mt-24 bg-[var(--faq-bg)] py-24 lg:py-36 ${
        inView ? "faq-in" : ""
      }`}
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="text-center">
          <p
            className="faq-item text-[0.7rem] font-light uppercase tracking-[0.42em] text-[var(--accent)]"
            style={{ "--d": "0ms" } as React.CSSProperties}
          >
            {faqs.eyebrow}
          </p>
          <h2
            id="faq-heading"
            className="faq-item mt-6 text-[clamp(2.4rem,5vw,3.6rem)] font-bold leading-[1.08] tracking-[0.01em] text-[var(--fg)]"
            style={
              { fontFamily: "var(--font-serif)", "--d": "120ms" } as React.CSSProperties
            }
          >
            {faqs.titleA}
            <em className="mt-1 block italic text-[var(--accent)]">
              {faqs.titleB}
            </em>
          </h2>
          <p
            className="faq-item mx-auto mt-6 max-w-[52ch] text-[1rem] font-normal leading-[1.8] text-[var(--fg-soft)]"
            style={{ "--d": "240ms" } as React.CSSProperties}
          >
            {faqs.description}
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-[900px] space-y-4">
          {items.map((faq, i) => (
            <FaqCard
              key={faq.id}
              faq={faq}
              index={i}
              open={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
