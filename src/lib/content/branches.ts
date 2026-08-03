export const branches = {
  eyebrow: "Our Branches",
  titleA: "Visit Your Nearest",
  titleB: "Killo's Biriyani",
  description:
    "Find the nearest Killo's Biriyani Arabian Restaurant and enjoy authentic Arabian flavours with your family and friends.",
} as const;

export interface BranchItem {
  id: string;
  name: string;
  address: string;
  hours: string;
  phones: string[];
  mapUrl: string;
  mapQuery?: string;
  primary?: boolean;
}

export const seedBranches: BranchItem[] = [
  {
    id: "branch-1",
    name: "Killo's Biriyani Arabian Restaurant",
    address: "Main Street, Mavadichenai, Valaichenai",
    hours: "10:00 AM – 12:00 AM",
    phones: ["076 66 36 37 3", "077 11 22 33 8"],
    mapUrl: "https://maps.app.goo.gl/zMCqZ5jyyXoHxbUT6",
    primary: true,
  },
  {
    id: "branch-2",
    name: "Killo's Biriyani Arabian Restaurant",
    address: "Hairath Street, Valaichenai",
    hours: "10:00 AM – 12:00 AM",
    phones: ["076 66 36 37 3", "077 11 22 33 8"],
    mapUrl: "https://maps.app.goo.gl/kaPNN8UoD3kLQo8U6",
  },
];
