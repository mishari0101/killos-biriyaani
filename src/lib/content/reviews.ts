export const reviews = {
  eyebrow: "Customer Reviews",
  titleA: "Loved by Thousands",
  titleB: "of Happy Customers",
  description:
    "See what our guests say about their dining experience at Killo's Biriyani.",
  rating: 4.9,
  ratingSuffix: "/ 5 Rating",
  reviewCount: "2,400+ Google Reviews",
} as const;

export interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  date: string;
  text: string;
  image?: string;
  pinned?: boolean;
}

export const seedReviews: ReviewItem[] = [
  {
    id: "review-1",
    name: "Sarah Mitchell",
    rating: 5,
    date: "2 weeks ago",
    text: "Best biriyani I've had outside of Colombo. The flavours are deep, the chicken is melt-in-the-mouth, and the service was warm and fast.",
    pinned: true,
  },
  {
    id: "review-2",
    name: "Mohamed Rizan",
    rating: 5,
    date: "1 month ago",
    text: "Authentic Arabian taste with a premium twist. The BBQ chicken is a must-try — perfectly charred and juicy.",
  },
  {
    id: "review-3",
    name: "Amaya Perera",
    rating: 5,
    date: "3 weeks ago",
    text: "We came for the family feast and left completely satisfied. Generous portions and every dish was packed with flavour.",
  },
  {
    id: "review-4",
    name: "Daniel Fernando",
    rating: 4,
    date: "1 month ago",
    text: "Great kothu and parotta — properly made. The karak chai is the perfect way to end the meal.",
  },
  {
    id: "review-5",
    name: "Fatima Zahra",
    rating: 5,
    date: "2 months ago",
    text: "The biriyani here is on another level. Fragrant rice, tender meat, and spices that hit just right.",
  },
  {
    id: "review-6",
    name: "Nadun Silva",
    rating: 5,
    date: "2 weeks ago",
    text: "Clean, welcoming place with food that tastes home-cooked but fancier. Highly recommended.",
  },
  {
    id: "review-7",
    name: "Hassan Ali",
    rating: 5,
    date: "3 months ago",
    text: "Everything we ordered was fresh and full of flavour. The staff treated us like family.",
  },
  {
    id: "review-8",
    name: "Ishara Wickrama",
    rating: 4,
    date: "1 month ago",
    text: "Delicious fried rice and short eats. Will definitely be back with the whole family.",
  },
];
