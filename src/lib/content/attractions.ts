export const attractions = {
  eyebrow: "Explore Nearby",
  titleA: "Discover Amazing",
  titleB: "Places Around Us",
  description:
    "Killo's Biriyani is perfectly located near some of Pasikuda's most popular attractions. Make your visit even more memorable by exploring these beautiful destinations.",
} as const;

export interface AttractionItem {
  id: string;
  name: string;
  description: string;
  rating: number;
  travelTime: string;
  image: string;
  mapUrl: string;
  featured?: boolean;
  imagePosition?: string;
}

export const seedAttractions: AttractionItem[] = [
  {
    id: "pasikuda-beach",
    name: "Pasikuda Beach",
    description:
      "Relax on one of Sri Lanka's most beautiful white-sand beaches with crystal-clear waters.",
    rating: 4.5,
    travelTime: "2 min drive",
    image: "/images/attractions/pasikuda.webp",
    imagePosition: "center center",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Pasikuda+Beach%2C+Sri+Lanka",
    featured: true,
  },
  {
    id: "passikudah-boat-ride",
    name: "Passikudah Boat Ride",
    description:
      "Enjoy boating, snorkeling and unforgettable sea adventures.",
    rating: 5.0,
    travelTime: "5 min drive",
    image: "/images/attractions/boatride.jpg",
    imagePosition: "center top",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Passikudah+Boat+Ride%2C+Sri+Lanka",
  },
  {
    id: "passikudah-corals-view",
    name: "Passikudah Corals View",
    description:
      "Explore the beautiful shallow coral reefs and clear blue waters.",
    rating: 4.6,
    travelTime: "5 min drive",
    image: "/images/attractions/corels.jpg",
    imagePosition: "center center",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Passikudah+Corals+View%2C+Sri+Lanka",
  },
  {
    id: "coconut-cultural-park",
    name: "Coconut Cultural Park",
    description:
      "Experience Sri Lankan coconut culture and taste homemade coconut ice cream.",
    rating: 4.1,
    travelTime: "10 min drive",
    image: "/images/attractions/cocnetpark.jpg",
    imagePosition: "center center",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Coconut+Cultural+Park%2C+Sri+Lanka",
  },
  {
    id: "maalu-maalu-resort",
    name: "Maalu Maalu Resort & Spa",
    description:
      "Luxury beachfront resort with dining, spa and stunning ocean views.",
    rating: 4.5,
    travelTime: "3 min drive",
    image: "/images/attractions/malu.jpg",
    imagePosition: "center center",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Maalu+Maalu+Resort+%26+Spa%2C+Sri+Lanka",
  },
];
