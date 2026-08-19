"use client";

import { useEffect, useRef, useState } from "react";
import type { MapPinData } from "../types";

const pins: MapPinData[] = [
  {
    name: "Bloom & Stem",
    items: "12 fresh items",
    top: "18%",
    left: "8%",
    color: "#f472b6",
    image:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Corner Market",
    items: "8 items nearby",
    top: "57%",
    left: "48%",
    color: "#22d3ee",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "The Bakehouse",
    items: "Open now",
    top: "33%",
    right: "7%",
    color: "#fb923c",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80",
  },
];

export function useLandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activePin, setActivePin] = useState("Bloom & Stem");
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    const onMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", onScroll);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleMapMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mapRef.current.style.setProperty("--mx", `${x}`);
    mapRef.current.style.setProperty("--my", `${y}`);
  };

  const handleMapLeave = () => {
    if (!mapRef.current) return;
    mapRef.current.style.setProperty("--mx", "0");
    mapRef.current.style.setProperty("--my", "0");
  };

  return {
    scrolled,
    submitted,
    activePin,
    setActivePin,
    mouse,
    mapRef,
    handleSubmit,
    handleMapMove,
    handleMapLeave,
    pins,
  };
}
