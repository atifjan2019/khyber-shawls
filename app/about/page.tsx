import Image from "next/image"

const timeline = [
  {
    year: "1992",
    title: "Founding in the Khyber Valley",
    description:
      "Started as a family atelier blending Kashmiri and Pashtun weaving traditions.",
  },
  {
    year: "2004",
    title: "First International Showcase",
    description:
      "Featured at a slow-fashion fair in Paris highlighting ethical textile stories.",
  },
  {
    year: "2020",
    title: "Sustainable Fibre Commitment",
    description:
      "Partnered with local co-ops to ensure traceability from goat herders to loom.",
  },
]

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <section className="grid gap-10 rounded-3xl border bg-card p-10 shadow-sm md:grid-cols-[1.3fr,1fr]">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Our story
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Craftsmanship rooted in the mountains of Khyber.
          </h1>
          <p className="text-muted-foreground">
            Khyber Shawls was born from a desire to safeguard centuries-old techniques of
            hand-spinning, dyeing, and weaving. Our artisans work in small collectives,
            preserving motifs that honour the region’s culture while embracing modern silhouettes.
          </p>
          <p className="text-muted-foreground">
            Every shawl supports education and healthcare initiatives in our partner villages.
            When you wrap yourself in a Khyber piece, you carry a tapestry of stories, resilience,
            and artistry from the Silk Route.
          </p>
        </div>
        <div className="relative h-80 overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1513097847644-f00cfe868607?auto=format&fit=crop&w=1200&q=80"
            alt="Artisan weaving on a loom"
            fill
            className="object-cover"
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Milestones</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {timeline.map((item) => (
            <div key={item.year} className="rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold text-primary">{item.year}</p>
              <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
