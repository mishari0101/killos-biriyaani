import { site } from "./site";

export type WhyChooseIcon =
  | "flame"
  | "leaf"
  | "chef"
  | "users"
  | "clock"
  | "heart";

export interface WhyChooseItem {
  icon: WhyChooseIcon;
  title: string;
  note?: string;
  description: string;
  image: string;
  objectPosition?: string;
}

export const whyChoose = {
  eyebrow: "Why Choose Us",
  titleA: "Why Choose",
  titleB: "Killo's Biriyani",
  description:
    "At Killo's Biriyani we blend age-old Arabian recipes with the finest ingredients and genuine hospitality — every plate crafted to feel like a celebration.",
  statement:
    "Serving unforgettable Arabian flavours with passion, premium quality, and warm hospitality.",
} as const;

export const features: WhyChooseItem[] = [
  {
    icon: "leaf",
    title: "Premium Ingredients",
    description: "Only carefully selected quality ingredients.",
    image: "/images/why-choose/Ingredients.webp",
    objectPosition: "50% 60%",
  },
  {
    icon: "flame",
    title: "Authentic Arabian Flavors",
    description: "Traditional recipes with rich authentic taste.",
    image: "/images/why-choose/AuthenticArabianFlavors.webp",
    objectPosition: "50% 55%",
  },
  {
    icon: "chef",
    title: "Freshly Prepared",
    description: "Every meal is freshly cooked for maximum flavor.",
    image: "/images/why-choose/FreshlyPrepared.webp",
    objectPosition: "50% 60%",
  },
  {
    icon: "users",
    title: "Family Friendly",
    description: "Perfect for family gatherings and friends.",
    image: "/images/why-choose/FamilyFriendly.webp",
    objectPosition: "50% 45%",
  },
  {
    icon: "clock",
    title: "Open Daily",
    note: site.hours.time,
    description: "Fresh food served every day.",
    image: "/images/why-choose/OpenDaily.webp",
    objectPosition: "50% 60%",
  },
  {
    icon: "heart",
    title: "Warm Hospitality",
    description: "Friendly service and memorable dining experience.",
    image: "/images/why-choose/WarmHospitality.webp",
    objectPosition: "50% 55%",
  },
];
