import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { WhyChoose } from "@/components/sections/why-choose";
import { Menu } from "@/components/sections/menu";
import { Attractions } from "@/components/sections/attractions";
import { Gallery } from "@/components/sections/gallery";
import { Reviews } from "@/components/sections/reviews";
import { Branches } from "@/components/sections/branches";
import { Faqs } from "@/components/sections/faqs";
import { Contact } from "@/components/sections/contact";
import { Location } from "@/components/sections/location";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <WhyChoose />
      <Menu />
      <Attractions />
      <Gallery />
      <Reviews />
      <Branches />
      <Faqs />
      <Contact />
      <Location />
      <Footer />
    </main>
  );
}
