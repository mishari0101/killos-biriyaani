export const site = {
  name: "Killo's Biriyani",
  shortName: "Killo's",
  tagline: "Arabian Restaurant",
  phone: "+94 77 000 0000",
  phoneHref: "tel:+94770000000",
  whatsapp: "94770000000",
  email: "hello@killosbiriyani.com",
  address: "No. 12, Main Street, Colombo, Sri Lanka",
  hours: {
    label: "Opening Hours",
    time: "10:00 AM – 12:00 AM",
    note: "Open Daily",
  } as const,
  mapQuery: "Killo's Biriyani Arabian Restaurant",
} as const;

// Full list — used by the mobile menu (keep as-is).
export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Menu", href: "#menu" },
  { label: "Gallery", href: "#gallery" },
  { label: "Reviews", href: "#reviews" },
  { label: "Branches", href: "#branches" },
  { label: "FAQ", href: "#faq" },
  { label: "Reservation", href: "#reservation" },
  { label: "Contact", href: "#contact" },
] as const;

// Desktop top-level nav (Reservation lives in the Reserve CTA only).
export const primaryNavLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Menu", href: "#menu" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
] as const;

// Desktop "More ▾" dropdown items.
export const moreNavLinks = [
  { label: "Reviews", href: "#reviews" },
  { label: "Branches", href: "#branches" },
  { label: "FAQ", href: "#faq" },
] as const;

export const logo = {
  src: "/images/logo/logo.svg",
  alt: `${site.name} — ${site.tagline}`,
} as const;
