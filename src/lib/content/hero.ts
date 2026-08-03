export interface HeroDish {
  name: string;
  tag: string;
  description: string;
  image: string;
}

export interface GoogleRating {
  score: string;
  reviews: string;
  source: string;
}

export const hero = {
  eyebrow: "Authentic Arabian Biriyani & Grill",
  titleLineA: "Killo's",
  titleLineB: "Biriyani",
  titleAccent: "Arabian Restaurant",
  headline:
    "The taste of Arabia — dum-cooked over open fire, served with a touch of luxury.",
  rating: {
    score: "4.9",
    reviews: "2,400+",
    source: "Google Reviews",
  } satisfies GoogleRating,
  customers: [
    { initials: "RA", name: "Rashid A." },
    { initials: "FM", name: "Fathima M." },
    { initials: "SK", name: "Sana K." },
    { initials: "AM", name: "Ahmed M." },
  ],
  ctaPrimary: { label: "View Menu", href: "#menu" },
  ctaSecondary: { label: "Reserve Table", href: "#reservation" },
  sliderIntervalMs: 4000,
} as const;

export const dishes: HeroDish[] = [
  {
    name: "Chicken Biriyani",
    tag: "Signature",
    description: "Slow-cooked basmati, tender chicken & Arabian spices.",
    image: "/images/dishes/Chikenbiriyani.webp",
  },
  {
    name: "Mutton Biriyani",
    tag: "Premium",
    description: "Fall-apart mutton, saffron basmati & our secret blend.",
    image: "/images/dishes/MuttonBiriyani.webp",
  },
  {
    name: "BBQ Chicken",
    tag: "Char-Grilled",
    description: "Flame-kissed chicken in an Arabian charcoal marinade.",
    image: "/images/dishes/BBQchiken.webp",
  },
  {
    name: "Fried Rice",
    tag: "House Special",
    description: "Wok-fired rice tossed with garden-fresh vegetables.",
    image: "/images/dishes/FriedRice.webp",
  },
  {
    name: "Parotta",
    tag: "Flaky Layers",
    description: "Crisp, hand-layered golden flatbread, served warm.",
    image: "/images/dishes/Parotta.webp",
  },
  {
    name: "Kothu",
    tag: "Sizzling",
    description: "Griddle-chopped parotta with spices & egg, served hot.",
    image: "/images/dishes/Kothu.webp",
  },
  {
    name: "Short Eats",
    tag: "Snack Platter",
    description: "A platter of Arabian short eats & savoury bites.",
    image: "/images/dishes/shorteats.webp",
  },
  {
    name: "Hot Milk Tea",
    tag: "Beverage",
    description: "Steaming Arabian milk tea — sweet, spiced & soothing.",
    image: "/images/dishes/hotmilktea.webp",
  },
];
