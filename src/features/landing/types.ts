import type { LucideIcon } from "lucide-react";

export interface HeroSlide {
  src: string;
  label: string;
  /** The globe art is small, so it is fitted to the hero height instead of covering it. */
  fit?: "cover" | "globe";
}

export interface HowStep {
  title: string;
  hint: string;
  heading: string;
  body: string;
  /** Prompt shown before the visitor tries the step's action. Absent for steps with no action. */
  todo?: string;
  /** Confirmation shown once the action is done. */
  doneText?: string;
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
