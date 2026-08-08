"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { fetchFooter, FOOTER_POLL_MS } from "@/lib/footer";
import { seedFooter, type FooterContent } from "@/lib/content/footer";
import { telHref } from "@/lib/branches";
import {
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { BackToTop } from "@/components/back-to-top";

const SOCIAL_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  whatsapp: WhatsAppIcon,
};

export interface BranchFooterContact {
  phones: string[];
  hours: string;
  hoursNote: string;
  locations: string[];
  whatsappHref: string;
}

function FooterColumn({
  title,
  index,
  children,
}: {
  title: string;
  index: number;
  children: ReactNode;
}) {
  return (
    <div
      className="footer-item"
      style={{ "--d": `${260 + index * 100}ms` } as React.CSSProperties}
    >
      <h3 className="text-[0.68rem] font-medium uppercase tracking-[0.32em] text-[var(--accent)]">
        {title}
      </h3>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function Footer({ branchContact }: { branchContact?: BranchFooterContact }) {
  const footerRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [data, setData] = useState<FooterContent>(seedFooter);
  const [logoFailed, setLogoFailed] = useState(false);
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "success" | "error">(
    "idle"
  );

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const next = await fetchFooter();
      if (alive) setData(next);
    };
    load();
    if (FOOTER_POLL_MS > 0) {
      const id = setInterval(load, FOOTER_POLL_MS);
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
    const el = footerRef.current;
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

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    setFeedback(valid ? "success" : "error");
    if (valid) setEmail("");
  };

  const baseSocials = data.socials.filter(
    (s) => s.enabled && s.href?.trim()
  );

  // Merge WhatsApp: branch contact takes priority, then settings from API
  const whatsappHref =
    branchContact?.whatsappHref ??
    baseSocials.find((s) => s.id === "whatsapp")?.href ??
    "";

  const socials = [
    ...baseSocials.filter((s) => s.id !== "whatsapp"),
    ...(whatsappHref
      ? [{ id: "whatsapp", label: "WhatsApp", href: whatsappHref, enabled: true }]
      : []),
  ];
  const quickLinks = data.quickLinks.filter((l) => l.enabled);
  const policyLinks = data.policyLinks.filter((l) => l.enabled);

  const phones =
    branchContact && branchContact.phones.length ? branchContact.phones : data.phones;
  const hours = branchContact?.hours ?? data.hours;
  const hoursNote = branchContact?.hoursNote ?? data.hoursNote;
  const locations =
    branchContact && branchContact.locations.length
      ? branchContact.locations
      : data.locations;

  return (
    <footer
      id="footer"
      ref={footerRef}
      className={`relative overflow-hidden bg-[var(--footer-bg)] ${
        inView ? "footer-in" : ""
      }`}
    >
      {/* soft glass divider at the top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--footer-divider)] to-transparent"
      />

      <div className="mx-auto max-w-[1440px] px-6 pt-20 pb-16 lg:px-10 lg:pt-28 lg:pb-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.35fr] lg:gap-x-14">
          {/* ---- Column 1: brand ---- */}
          <div
            className="footer-item"
            style={{ "--d": "140ms" } as React.CSSProperties}
          >
            <a
              href="#home"
              className="flex items-center gap-3"
              aria-label={`${data.name} — home`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-white shadow-[0_10px_25px_-10px_var(--shadow-color)] ring-1 ring-white/20">
                {!logoFailed ? (
                  <Image
                    src={data.logo.src}
                    alt=""
                    width={48}
                    height={48}
                    unoptimized
                    className="h-full w-full object-contain"
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  <span
                    className="text-xl font-semibold text-[#1a1a1a]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    K
                  </span>
                )}
              </span>
              <span className="flex flex-col leading-none">
                <span
                  className="text-[1.25rem] tracking-wide text-[var(--fg)]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {data.name}
                </span>
                <span className="mt-1.5 text-[0.56rem] uppercase tracking-[0.42em] text-[var(--accent)]">
                  {data.tagline}
                </span>
              </span>
            </a>

            <p className="mt-7 max-w-[38ch] text-[0.92rem] font-light leading-[1.85] text-[var(--fg-soft)]">
              {data.description}
            </p>

            {socials.length > 0 && (
              <div className="mt-8 flex items-center gap-3">
                {socials.map((social) => {
                  const Icon = SOCIAL_ICONS[social.id] ?? WhatsAppIcon;
                  return (
                    <a
                      key={social.id}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social"
                      aria-label={`${social.label} — ${data.name}`}
                      title={social.label}
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* ---- Column 2: quick links ---- */}
          <FooterColumn title="Quick Links" index={1}>
            {quickLinks.length > 0 && (
              <ul className="grid gap-x-4 gap-y-3.5">
                {quickLinks.map((link) => (
                  <li key={link.id}>
                    <a href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </FooterColumn>

          {/* ---- Column 3: contact ---- */}
          <FooterColumn title="Contact" index={2}>
            <div className="space-y-7">
              <div>
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-[var(--fg-muted)]">
                  Phone
                </p>
                <ul className="mt-3 space-y-2">
                  {phones.map((phone) => (
                    <li key={phone}>
                      <a
                        href={telHref(phone)}
                        className="footer-link flex items-center gap-2.5"
                      >
                        <PhoneIcon size={14} className="text-[var(--accent)]" />
                        {phone}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-[var(--fg-muted)]">
                  Opening Hours
                </p>
                <p className="mt-3 flex items-start gap-2.5 text-[0.9rem] text-[var(--fg-soft)]">
                  <ClockIcon size={14} className="mt-1 shrink-0 text-[var(--accent)]" />
                  <span>
                    <span className="font-medium text-[var(--fg)]">
                      {hoursNote}
                    </span>
                    <span className="mx-1.5 text-[var(--fg-muted)]">·</span>
                    {hours}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-[var(--fg-muted)]">
                  Locations
                </p>
                <ul className="mt-3 space-y-2">
                  {locations.map((location) => (
                    <li
                      key={location}
                      className="flex items-start gap-2.5 text-[0.9rem] text-[var(--fg-soft)]"
                    >
                      <MapPinIcon size={14} className="mt-1 shrink-0 text-[var(--accent)]" />
                      <span>{location}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FooterColumn>

          {/* ---- Column 4: newsletter ---- */}
          <FooterColumn title={data.newsletter.title} index={3}>
            <p className="text-[0.92rem] font-light leading-[1.85] text-[var(--fg-soft)]">
              {data.newsletter.description}
            </p>

            {data.newsletter.status === "active" ? (
              <form onSubmit={handleSubscribe} noValidate className="mt-6">
                <div className="flex items-center gap-2 rounded-full border border-[var(--footer-input-border)] bg-[var(--footer-input-bg)] p-1.5 pl-5 transition-colors duration-300 focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_4px_var(--accent-soft)]">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={data.newsletter.placeholder}
                    aria-label={data.newsletter.placeholder}
                    className="min-w-0 flex-1 bg-transparent text-[0.9rem] text-[var(--footer-input-fg)] placeholder:text-[var(--fg-muted)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="btn btn-brand h-11 shrink-0 px-6"
                  >
                    {data.newsletter.button}
                  </button>
                </div>
                <p
                  className="mt-3 min-h-[1.1rem] text-[0.72rem] font-normal tracking-[0.02em]"
                  aria-live="polite"
                >
                  {feedback === "success" && (
                    <span className="text-[var(--accent)]">
                      {data.newsletter.success}
                    </span>
                  )}
                  {feedback === "error" && (
                    <span className="text-[var(--brand-cta)]">
                      {data.newsletter.error}
                    </span>
                  )}
                </p>
              </form>
            ) : (
              <p className="mt-6 text-[0.85rem] text-[var(--fg-muted)]">
                {data.newsletter.status}
              </p>
            )}
          </FooterColumn>
        </div>
      </div>

      {/* ---- Bottom bar ---- */}
      <div
        className="footer-item border-t border-[var(--footer-divider)]"
        style={{ "--d": "640ms" } as React.CSSProperties}
      >
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-5 px-6 py-8 text-center lg:flex-row lg:justify-between lg:gap-8 lg:px-10 lg:text-left">
          <p className="text-[0.8rem] font-normal tracking-[0.02em] text-[var(--fg-muted)]">
            {data.copyright}
          </p>

          <ul className="flex items-center gap-6">
            {policyLinks.map((link) => (
              <li key={link.id}>
                <a href={link.href} className="footer-link text-[0.8rem]">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="flex flex-wrap items-center justify-center gap-1.5 text-[0.8rem] font-normal tracking-[0.02em] text-[var(--fg-muted)]">
            Developed by FluxMedia
          </p>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}
