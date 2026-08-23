const PHRASE = "Authentic Arabian Cuisine • Traditional Recipes • Bold Flavours • Killo's Biriyani";

function Seq() {
  return (
    <span className="flex shrink-0 items-center">
      {Array.from({ length: 4 }, (_, i) => (
        <span key={i} className="flex items-center">
          {PHRASE.split(" • ").map((part, j) => (
            <span key={j} className="flex items-center">
              <span className="he-marquee-word">{part}</span>
              <span aria-hidden="true" className="he-marquee-dot">
                •
              </span>
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

export function TypeMarquee() {
  return (
    <section
      aria-hidden="true"
      className="marquee relative w-full overflow-hidden py-14 sm:py-16 lg:py-20"
    >
      {/* two identical halves — the track loops at exactly -50% for a seamless roll */}
      <div className="marquee-track flex w-max items-center whitespace-nowrap">
        <Seq />
        <Seq />
      </div>
    </section>
  );
}
