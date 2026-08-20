import Image from "next/image";
import { Star } from "lucide-react";

export function LandingTestimonial() {
  return (
    <section className="testimonial-section">
      <div className="testimonial-glow" />

      <div className="testimonial-inner">
        <div className="quote-mark">&ldquo;</div>

        <blockquote>
          I take one photo, and it&apos;s live before the customer even parks.
          It finally feels like the internet was built for a shop like mine.
        </blockquote>

        <div className="testimonial-person">
          <div className="testimonial-avatar">
            <Image
              fill
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
              alt="Elena"
              className="object-cover"
            />
          </div>

          <div>
            <strong>Elena Ruiz</strong>
            <span>Petal &amp; Stem Florist</span>
          </div>
        </div>

        <div className="testimonial-rating">
          <Star size={13} fill="currentColor" />
          <Star size={13} fill="currentColor" />
          <Star size={13} fill="currentColor" />
          <Star size={13} fill="currentColor" />
          <Star size={13} fill="currentColor" />
        </div>
      </div>
    </section>
  );
}
