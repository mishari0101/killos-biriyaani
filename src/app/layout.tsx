import type { Metadata, Viewport } from "next";
import { Oswald, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Resize the layout viewport when the mobile keyboard opens so the
  // focused input is never hidden behind it.
  interactiveWidget: "resizes-content",
};

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Killo's Biriyani — Arabian Restaurant",
  description:
    "The taste of Arabia — dum-cooked over open fire, served with a touch of luxury. Open daily 10:00 AM – 12:00 AM.",
  openGraph: {
    title: "Killo's Biriyani — Arabian Restaurant",
    description:
      "Authentic Arabian biriyani & grill, dum-cooked over open fire. Open daily 10:00 AM – 12:00 AM.",
    type: "website",
  },
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('killo-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){document.documentElement.classList.add('dark')}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${playfair.variable} ${poppins.variable} ${oswald.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
