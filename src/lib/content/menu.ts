export const menu = {
  eyebrow: "Signature Menu",
  titleA: "Discover Our",
  titleB: "Signature Dishes",
  description:
    "Experience authentic Arabian flavours crafted with premium ingredients and traditional recipes.",
} as const;

export const menuCategories = [
  { id: "all", label: "All" },
  { id: "biriyani", label: "Biriyani" },
  { id: "bbq", label: "BBQ Chicken" },
  { id: "parotta", label: "Parotta" },
  { id: "kothu", label: "Kothu" },
  { id: "fried-rice", label: "Fried Rice" },
  { id: "short-eats", label: "Short Eats" },
  { id: "hot-drinks", label: "Hot Drinks" },
] as const;

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
}

export const menuItems: MenuItem[] = [
  {
    id: "chicken-biriyani",
    name: "Chicken Biriyani",
    description: "Slow-cooked basmati with tender chicken & Arabian spices.",
    price: "Rs 1,200",
    category: "biriyani",
    image: "/images/menu/ChickenBiriyani.webp",
  },
  {
    id: "mutton-biriyani",
    name: "Mutton Biriyani",
    description: "Fall-apart mutton, saffron basmati & our secret spice blend.",
    price: "Rs 1,800",
    category: "biriyani",
    image: "/images/menu/MuttonBiriyani.webp",
  },
  {
    id: "beef-biriyani",
    name: "Beef Biriyani",
    description: "Rich spiced beef layered over fragrant dum-cooked rice.",
    price: "Rs 1,500",
    category: "biriyani",
    image: "",
  },
  {
    id: "special-biriyani",
    name: "Killo's Special Biriyani",
    description: "The house signature — every jewel of our craft on one plate.",
    price: "Rs 1,650",
    category: "biriyani",
    image: "",
  },
  {
    id: "bbq-chicken-quarter",
    name: "BBQ Chicken (Quarter)",
    description: "Charcoal-grilled & flame-kissed in our Arabian marinade.",
    price: "Rs 950",
    category: "bbq",
    image: "/images/menu/BBQChicken.webp",
  },
  {
    id: "bbq-chicken-half",
    name: "BBQ Chicken (Half)",
    description: "A generous half bird, smoked and glazed to perfection.",
    price: "Rs 1,750",
    category: "bbq",
    image: "/images/menu/BBQChicken.webp",
  },
  {
    id: "plain-parotta",
    name: "Plain Parotta",
    description: "Hand-layered, flaky golden flatbread served warm.",
    price: "Rs 350",
    category: "parotta",
    image: "/images/menu/Parotta.webp",
  },
  {
    id: "egg-parotta",
    name: "Egg Parotta",
    description: "Crisp parotta tossed with spiced scrambled egg.",
    price: "Rs 550",
    category: "parotta",
    image: "/images/menu/Parotta.webp",
  },
  {
    id: "chicken-parotta",
    name: "Chicken Parotta",
    description: "Flaky parotta folded with tender spiced chicken.",
    price: "Rs 850",
    category: "parotta",
    image: "/images/menu/Parotta.webp",
  },
  {
    id: "chicken-kothu",
    name: "Chicken Kothu",
    description: "Griddle-chopped parotta, egg & spices — sizzling hot.",
    price: "Rs 900",
    category: "kothu",
    image: "/images/menu/Kothu.webp",
  },
  {
    id: "mutton-kothu",
    name: "Mutton Kothu",
    description: "Chopped parotta tossed with slow-cooked mutton.",
    price: "Rs 1,150",
    category: "kothu",
    image: "/images/menu/Kothu.webp",
  },
  {
    id: "veg-fried-rice",
    name: "Veg Fried Rice",
    description: "Wok-fired rice with garden-fresh vegetables.",
    price: "Rs 700",
    category: "fried-rice",
    image: "/images/menu/FriedRice.webp",
  },
  {
    id: "egg-fried-rice",
    name: "Egg Fried Rice",
    description: "Smoky wok rice tossed with seasoned egg.",
    price: "Rs 750",
    category: "fried-rice",
    image: "/images/menu/FriedRice.webp",
  },
  {
    id: "chicken-fried-rice",
    name: "Chicken Fried Rice",
    description: "Wok-fired with tender chicken & house soy.",
    price: "Rs 850",
    category: "fried-rice",
    image: "/images/menu/FriedRice.webp",
  },
  {
    id: "samosa",
    name: "Samosa",
    description: "Crisp golden pastry with a spiced potato filling.",
    price: "Rs 250",
    category: "short-eats",
    image: "",
  },
  {
    id: "chicken-roll",
    name: "Chicken Roll",
    description: "Flaky roll packed with spiced, shredded chicken.",
    price: "Rs 350",
    category: "short-eats",
    image: "",
  },
  {
    id: "hot-milk-tea",
    name: "Hot Milk Tea",
    description: "Steaming, sweet & gently spiced Arabian milk tea.",
    price: "Rs 300",
    category: "hot-drinks",
    image: "",
  },
  {
    id: "karak-chai",
    name: "Karak Chai",
    description: "Strong, creamy Arabian karak brewed to order.",
    price: "Rs 350",
    category: "hot-drinks",
    image: "",
  },
];
