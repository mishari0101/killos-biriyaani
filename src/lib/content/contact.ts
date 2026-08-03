export const contact = {
  eyebrow: "Contact",
  titleA: "Reserve Your Table",
  titleB: "Today",
  description:
    "Experience authentic Arabian flavours with your family and friends. Book your table in just a few seconds.",
} as const;

export const infoCard = {
  title: "Restaurant Information",
  description:
    "We're always happy to assist you. Choose your preferred way to contact us.",
} as const;

export const contactInfo = {
  phones: ["076 66 36 37 3", "077 11 22 33 8"],
  whatsappMessage:
    "Hello Killo's Biriyani! I'd like to reserve a table.",
  addresses: ["Main Street, Mavadichenai", "Hairath Street, Valaichenai"],
  hours: "10:00 AM – 12:00 AM",
  hoursNote: "Open Daily",
  openFromHour: 10,
  openToHour: 24,
} as const;

export const formLabels = {
  name: "Full Name",
  phone: "Phone Number",
  guests: "Number of Guests",
  date: "Reservation Date",
  time: "Reservation Time",
  occasion: "Occasion",
  request: "Special Request",
} as const;

export const occasionOptions = [
  "Birthday",
  "Family Dinner",
  "Business Meeting",
  "Anniversary",
  "Other",
] as const;

export const success = {
  title: "Reservation Request Sent",
  message:
    "Our team will contact you shortly to confirm your booking.",
} as const;

export const submitCta = {
  idle: "Reserve Table",
  loading: "Reserving...",
  footnote: "We'll confirm your booking by phone or WhatsApp.",
} as const;

export interface ReservationInput {
  name: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  request?: string;
  occasion?: string;
}
