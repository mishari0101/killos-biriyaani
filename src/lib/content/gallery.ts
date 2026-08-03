export const gallery = {
  eyebrow: "Our Gallery",
  titleA: "Moments From",
  titleB: "The Kitchen",
  description:
    "A visual taste of our craft — every plate, flame and celebration captured in the moment.",
} as const;

export interface GalleryItem {
  id: string;
  label: string;
  caption: string;
  aspect: string;
  image: string;
}

export const galleryItems: GalleryItem[] = [
  {
    id: "signature-biriyani",
    label: "Killo's Signature Biriyani",
    caption: "Dum-cooked basmati crowned with saffron, mint & tender chicken.",
    aspect: "4 / 5",
    image: "",
  },
  {
    id: "charcoal-flame",
    label: "Charcoal Flame",
    caption: "Flame-kissed BBQ chicken fresh off the grill.",
    aspect: "1 / 1",
    image: "",
  },
  {
    id: "flaky-parotta",
    label: "Flaky Parotta",
    caption: "Hand-layered parotta, golden and crisp.",
    aspect: "4 / 3",
    image: "",
  },
  {
    id: "the-spice-wall",
    label: "The Spice Wall",
    caption: "Our arsenal of Arabian spices, ground daily.",
    aspect: "3 / 4",
    image: "",
  },
  {
    id: "wok-fire",
    label: "Wok Fire",
    caption: "Smoky kothu sizzling on the flat top.",
    aspect: "4 / 3",
    image: "",
  },
  {
    id: "karak-pour",
    label: "Karak Pour",
    caption: "Steaming karak chai poured to order.",
    aspect: "3 / 4",
    image: "",
  },
  {
    id: "golden-crumb",
    label: "Golden Crumb",
    caption: "Crisp samosa straight from the fryer.",
    aspect: "1 / 1",
    image: "",
  },
  {
    id: "family-feast",
    label: "Family Feast",
    caption: "A table spread made for sharing.",
    aspect: "4 / 5",
    image: "",
  },
  {
    id: "dum-seal",
    label: "Dum Seal",
    caption: "The sealed pot, where the magic steams.",
    aspect: "4 / 3",
    image: "",
  },
  {
    id: "plate-and-palette",
    label: "Plate & Palette",
    caption: "Our biriyani, plated like jewellery.",
    aspect: "1 / 1",
    image: "",
  },
  {
    id: "morning-steam",
    label: "Morning Steam",
    caption: "Fresh griddle bread at first light.",
    aspect: "3 / 4",
    image: "",
  },
  {
    id: "the-gathering",
    label: "The Gathering",
    caption: "Good food, better company.",
    aspect: "4 / 3",
    image: "",
  },
];
