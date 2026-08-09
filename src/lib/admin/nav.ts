import {
  CalendarDaysIcon,
  GridIcon,
  MailIcon,
  MessageSquareIcon,
  SettingsIcon,
  SparklesIcon,
  StarIcon,
  StoreIcon,
  UtensilsIcon,
  UserIcon,
} from "@/components/ui/icons";
import type { ComponentType } from "react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number }>;
  description: string;
  status: "active" | "planned";
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const adminNavSections: AdminNavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: GridIcon,
        description: "Today's pulse at a glance",
        status: "active",
      },
      {
        label: "Reservations",
        href: "/admin/reservations",
        icon: CalendarDaysIcon,
        description: "Bookings, tables & waitlist",
        status: "active",
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        label: "Menu",
        href: "/admin/menu",
        icon: UtensilsIcon,
        description: "Dishes, categories & prices",
        status: "active",
      },
      {
        label: "Gallery",
        href: "/admin/gallery",
        icon: SparklesIcon,
        description: "Photos & highlights",
        status: "active",
      },
      {
        label: "Attractions",
        href: "/admin/attractions",
        icon: StarIcon,
        description: "Why guests choose us",
        status: "active",
      },
      {
        label: "Reviews",
        href: "/admin/reviews",
        icon: MessageSquareIcon,
        description: "Guest feedback & moderation",
        status: "active",
      },
      {
        label: "Branches",
        href: "/admin/branches",
        icon: StoreIcon,
        description: "Locations & opening hours",
        status: "active",
      },
      {
        label: "Contact",
        href: "/admin/contact",
        icon: MailIcon,
        description: "Inbox & enquiry leads",
        status: "active",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Account",
        href: "/admin/account",
        icon: UserIcon,
        description: "Profile, password & sign-in",
        status: "active",
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: SettingsIcon,
        description: "Site preferences & auth",
        status: "active",
      },
    ],
  },
];
