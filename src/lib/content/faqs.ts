export const faqs = {
  eyebrow: "FAQ",
  titleA: "Everything You",
  titleB: "Need to Know",
  description:
    "Find answers to the most common questions about Killo's Biriyani Arabian Restaurant.",
} as const;

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  enabled: boolean;
}

export const seedFaqs: FaqItem[] = [
  {
    id: "faq-1",
    question: "What are your opening hours?",
    answer: "We are open daily from 10:00 AM to 12:00 AM.",
    enabled: true,
  },
  {
    id: "faq-2",
    question: "Do you offer takeaway?",
    answer: "Yes. All menu items are available for takeaway.",
    enabled: true,
  },
  {
    id: "faq-3",
    question: "Do you accept reservations?",
    answer:
      "Yes. You can reserve your table by calling us or contacting us through WhatsApp.",
    enabled: true,
  },
  {
    id: "faq-4",
    question: "Do you have family dining?",
    answer:
      "Yes. Our restaurant offers a comfortable and welcoming environment for families and groups.",
    enabled: true,
  },
  {
    id: "faq-5",
    question: "Where are your branches located?",
    answer:
      "We currently serve customers from our Main Street, Mavadichenai branch and our Hairath Street branch in Valaichenai.",
    enabled: true,
  },
  {
    id: "faq-6",
    question: "What types of food do you serve?",
    answer:
      "We serve authentic Arabian and South Asian cuisine including Chicken, Beef and Mutton Biriyani, BBQ Chicken, Fried Rice, Kothu, Parotta, Short Eats and Hot Drinks.",
    enabled: true,
  },
];
