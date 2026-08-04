import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { WhyChoose } from "@/components/sections/why-choose";
import { MenuData } from "@/components/sections/menu-data";
import { AttractionsData } from "@/components/sections/attractions-data";
import { GalleryData } from "@/components/sections/gallery-data";
import { ReviewsData } from "@/components/sections/reviews-data";
import { BranchesData } from "@/components/sections/branches-data";
import { Faqs } from "@/components/sections/faqs";
import { ContactData } from "@/components/sections/contact-data";
import { LocationData } from "@/components/sections/location-data";
import { FooterData } from "@/components/sections/footer-data";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <WhyChoose />
      <MenuData />
      <AttractionsData />
      <GalleryData />
      <ReviewsData />
      <BranchesData />
      <Faqs />
      <ContactData />
      <LocationData />
      <FooterData />
    </main>
  );
}
