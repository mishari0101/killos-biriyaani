import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/Navbar";
import { LoadingProvider } from "@/components/ui/loading-provider";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { FaqJsonLd } from "@/components/seo/faq-jsonld";
import { StructuredJsonLd } from "@/components/seo/structured-jsonld";
import { Analytics } from "@/components/seo/analytics";
import { FloatingWhatsApp } from "@/components/sections/floating-whatsapp";
import { buildSiteMetadata, getSettingsSafe } from "@/lib/seo/public";

export async function generateMetadata(): Promise<Metadata> {
  return buildSiteMetadata();
}

export async function generateViewport(): Promise<Viewport> {
  const settings = await getSettingsSafe();
  return {
    width: "device-width",
    initialScale: 1,
    interactiveWidget: "resizes-content",
    themeColor: settings?.accentColor.trim() || "#c9a227",
  };
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LoadingProvider>
      <LoadingScreen />
      <Navbar />
      {children}
      <FaqJsonLd />
      <StructuredJsonLd />
      <Analytics />
      <FloatingWhatsApp />
    </LoadingProvider>
  );
}
