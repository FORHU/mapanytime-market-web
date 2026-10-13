import type { LucideIcon } from "lucide-react";

export interface HeroSlide {
  src: string;
  label: string;
  /** The globe art is fitted to the hero height instead of covering it, so the globe never crops. */
  fit?: "cover" | "globe";
}

export interface HowStep {
  heading: string;
  body: string;
}

export interface StoryProduct {
  name: string;
  size: string;
  /** Example price in pesos. */
  price: number;
  /** Which crop of the store banner to show, as `.lp-crop--<crop>` in landing.css. */
  crop: "lettuce" | "red" | "yellow";
}

export interface MapStore {
  initials: string;
  color: string;
  name: string;
  area: string;
  distance: string;
  /** Marker position on the 1295x727 app map screenshot, in percent. */
  x: number;
  y: number;
}

export interface IconItem {
  icon: LucideIcon;
  title: string;
  body: string;
}

export interface MapPin {
  icon: LucideIcon;
  /** Position on the map card, in percent. */
  x: number;
  y: number;
}

export interface LinkItem {
  label: string;
  href: string;
}
