export interface FooterLink {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
}

export interface FooterSocial {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
}

export interface FooterNewsletter {
  status: string;
  title: string;
  description: string;
  placeholder: string;
  button: string;
  success: string;
  error: string;
}

export interface FooterContent {
  logo: { src: string; alt: string };
  name: string;
  tagline: string;
  description: string;
  socials: FooterSocial[];
  quickLinks: FooterLink[];
  phones: string[];
  hoursNote: string;
  hours: string;
  locations: string[];
  newsletter: FooterNewsletter;
  copyright: string;
  policyLinks: FooterLink[];
  credit: { label: string; href: string };
}

export const seedFooter: FooterContent = {
  logo: {
    src: "/images/logo/killoslogo.webp",
    alt: "Killo's Biriyani — Authentic Arabian Restaurant",
  },
  name: "Killo's Biriyani",
  tagline: "Authentic Arabian Restaurant",
  description:
    "Experience authentic Arabian and South Asian flavours crafted with premium ingredients, rich spices and warm hospitality.",
  socials: [
    {
      id: "facebook",
      label: "Facebook",
      href: "https://www.facebook.com/killosbiriyani",
      enabled: true,
    },
    {
      id: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/killosbiriyani",
      enabled: true,
    },
    {
      id: "tiktok",
      label: "TikTok",
      href: "https://www.tiktok.com/@killosbiriyani",
      enabled: true,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: "https://wa.me/94766636373",
      enabled: true,
    },
  ],
  quickLinks: [
    { id: "home", label: "Home", href: "#home", enabled: true },
    { id: "about", label: "About", href: "#about", enabled: true },
    { id: "menu", label: "Menu", href: "#menu", enabled: true },
    { id: "gallery", label: "Gallery", href: "#gallery", enabled: true },
    { id: "reviews", label: "Reviews", href: "#reviews", enabled: true },
    { id: "branches", label: "Branches", href: "#branches", enabled: true },
    { id: "faq", label: "FAQ", href: "#faq", enabled: true },
    { id: "blog", label: "Blog", href: "/blog", enabled: true },
    { id: "contact", label: "Contact", href: "#contact", enabled: true },
  ],
  phones: ["076 66 36 37 3", "077 11 22 33 8"],
  hoursNote: "Open Daily",
  hours: "10:00 AM – 12:00 AM",
  locations: ["Main Street, Mavadichenai", "Hairath Street, Valaichenai"],
  newsletter: {
    status: "active",
    title: "Stay Updated",
    description:
      "Receive updates about new menu items, special offers and restaurant news.",
    placeholder: "Email Address",
    button: "Subscribe",
    success: "Thank you for subscribing! We'll keep you updated.",
    error: "Please enter a valid email address.",
  },
  copyright: "© 2026 Killo's Biriyani Arabian Restaurant. All Rights Reserved.",
  policyLinks: [
    { id: "privacy", label: "Privacy Policy", href: "#", enabled: true },
    { id: "terms", label: "Terms & Conditions", href: "#", enabled: true },
  ],
  credit: { label: "Flux Media", href: "https://fluxmedia.com" },
};
