export type AboutHighlightIcon = "pot" | "leaf" | "flame" | "heart";

export interface AboutHighlight {
  icon: AboutHighlightIcon;
  title: string;
  description: string;
}

export const about = {
  eyebrow: "About Killo's",
  titleA: "Experience Authentic",
  titleB: "Arabian Flavours",
  titleC: "Like Never Before",
  description:
    "At Killo's, we bring the timeless soul of Arabian and South Asian cuisine to every table. From slow-cooked Chicken, Beef and Mutton Biriyani to flame-kissed BBQ, sizzling Kothu and flaky Parotta, each plate is crafted from premium ingredients and a masterful blend of spices — an experience meant to linger. Dine with us, take a taste home, or entrust us with your family's special occasions; every meal is served with exceptional quality and heartfelt hospitality.",
  image: "/images/why-choose/AuthenticArabianFlavors.webp",
  imageAlt:
    "Signature Arabian biriyani plated with rich spices at Killo's",
  cta: { label: "Explore Our Menu", href: "#menu" },
  quote:
    "Every plate tells a story of authentic Arabian flavours, premium ingredients, and heartfelt hospitality.",
} as const;

export const highlights: AboutHighlight[] = [
  {
    icon: "pot",
    title: "Authentic Arabian Cuisine",
    description: "Traditional Arabian and South Asian recipes.",
  },
  {
    icon: "leaf",
    title: "Premium Ingredients",
    description: "Fresh ingredients and rich spices.",
  },
  {
    icon: "flame",
    title: "Freshly Prepared Daily",
    description: "Every meal is cooked fresh.",
  },
  {
    icon: "heart",
    title: "Warm Hospitality",
    description: "Serving families with care and passion.",
  },
];
