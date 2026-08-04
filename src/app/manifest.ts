import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Killo's Biriyani — Arabian Restaurant",
    short_name: "Killo's",
    description:
      "The taste of Arabia — dum-cooked over open fire, served with a touch of luxury.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f8f6",
    theme_color: "#c9a227",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon.png", sizes: "48x48", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
