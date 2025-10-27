// components/testimonials.tsx
import Image from "next/image";

const testimonials = [
  {
    quote: "The quality of these shawls is simply breathtaking. I've never felt anything so soft and luxurious. It's a piece of art that I'll cherish forever.",
    author: "Aisha Khan",
    location: "Lahore, Pakistan",
    avatar: "/avatars/aisha.jpg",
  },
  {
    quote: "I bought a shawl for my wife, and she was overjoyed. The craftsmanship is exquisite, and the colors are so vibrant. Thank you for creating such beautiful pieces.",
    author: "David Smith",
    location: "London, UK",
    avatar: "/avatars/david.jpg",
  },
  {
    quote: "As a collector of fine textiles, I can say with confidence that Khyber Shawls are among the best in the world. The attention to detail is remarkable.",
    author: "Fatima Al-Fassi",
    location: "Dubai, UAE",
    avatar: "/avatars/fatima.jpg",
  },
];

export function Testimonials() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Testimonials</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-gray-900">What Our Customers Say</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.author} className="rounded-3xl bg-gray-50 p-8 shadow-sm">
              <div className="flex items-center gap-4">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
              </div>
              <p className="mt-6 text-gray-700 leading-relaxed">“{testimonial.quote}”</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
