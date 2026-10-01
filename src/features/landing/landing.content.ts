import {
  Bell,
  ClipboardCheck,
  Coffee,
  Croissant,
  Flower2,
  Gift,
  Heart,
  MapPin as MapPinIcon,
  Megaphone,
  Package,
  Sandwich,
  Shirt,
  ShoppingBasket,
  Sparkles,
  Star,
  Store,
  Ticket,
  Users,
  Utensils,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import type {
  HeroSlide,
  HowStep,
  IconItem,
  LinkItem,
  MapPin,
  MapStore,
} from "./types";

/*
 * Copy and example data for the landing page.
 *
 * Store names, areas, distances, products and order lines below are EXAMPLES for the demos. They
 * illustrate how the app behaves; they are not real listings. Every feature described here exists
 * in the product (map discovery, multi-store cart, pickup-only orders, pickup pass, wishlist,
 * MapPoints and vouchers, notifications, and the seller tools).
 */

export const HERO_SLIDES: HeroSlide[] = [
  { src: "/landing/globe.jpg", label: "Live map", fit: "globe" },
  { src: "/landing/h-store.jpg", label: "Thrift shop" },
  { src: "/landing/h-books.jpg", label: "Bookstore" },
  { src: "/landing/h-floral.jpg", label: "Flower stall" },
  { src: "/landing/h-seller.jpg", label: "Sellers" },
];

export const HOW_STEPS: HowStep[] = [
  {
    title: "Discover",
    hint: "Find a store",
    heading: "Find stores near you.",
    body: "Open the map and tap any store marker to see the store and how far away it is.",
    todo: "Try it: tap a store marker",
    doneText: "Nice. That is the store card.",
  },
  {
    title: "Shop",
    hint: "Fill your cart",
    heading: "Add what you like to your cart.",
    body: "Open a store, pick a product, and add it. You can shop from several stores at once.",
    todo: "Try it: press Add to cart",
    doneText: "Added. Your cart now has 2 items.",
  },
  {
    title: "Purchase",
    hint: "Order once",
    heading: "Place one pickup order.",
    body: "Check out once for everything in your cart. Each store sees your order and gets it ready.",
    todo: "Try it: place the order",
    doneText: "Done. The stores are preparing it.",
  },
  {
    title: "Pick up",
    hint: "Collect it",
    heading: "Collect it at the store.",
    body: "You get a notification when it's ready. Show your pickup pass at the counter and you're done.",
  },
];

/** Example stores behind three markers on the app map screenshot (Baguio City). */
export const MAP_STORES: MapStore[] = [
  {
    initials: "KR",
    color: "#4CA64E",
    name: "Kalye Roasters",
    area: "Near UP Baguio, Baguio City",
    distance: "0.5 km away",
    x: 44.6,
    y: 53.4,
  },
  {
    initials: "HG",
    color: "#B8763A",
    name: "Highland Greens",
    area: "Quirino Hill, Baguio City",
    distance: "1.2 km away",
    x: 32,
    y: 22.6,
  },
  {
    initials: "C8",
    color: "#3FA0B4",
    name: "Camp 8 Crafts",
    area: "Lourdes Extension, Baguio City",
    distance: "2.1 km away",
    x: 70.7,
    y: 16.4,
  },
];

export const SHOP_PRODUCT = {
  name: "Fresh Baguio Carrots (1kg)",
  store: "Baguio Fresh Harvest",
};

export const CART_ITEMS: { icon: LucideIcon; name: string; store: string }[] = [
  { icon: ShoppingBasket, name: SHOP_PRODUCT.name, store: SHOP_PRODUCT.store },
  { icon: Coffee, name: "Benguet coffee beans", store: "Kalye Roasters" },
];

/** Store icons scattered over the features map card. Positions are percentages of the card. */
export const VIEWPORT_PINS: MapPin[] = [
  { icon: Coffee, x: 12, y: 16 },
  { icon: Shirt, x: 29, y: 31 },
  { icon: BookOpen, x: 45, y: 13 },
  { icon: Flower2, x: 60, y: 29 },
  { icon: Store, x: 77, y: 12 },
  { icon: Utensils, x: 88, y: 36 },
  { icon: Gift, x: 52, y: 48 },
  { icon: ShoppingBasket, x: 72, y: 58 },
  { icon: Croissant, x: 90, y: 74 },
  { icon: Sandwich, x: 18, y: 50 },
];

export const NEAR_STORES = [
  { name: "Kalye Roasters", category: "Coffee", distance: "0.5 km" },
  { name: "Baguio Fresh Harvest", category: "Produce", distance: "0.8 km" },
  { name: "Highland Greens", category: "Plants", distance: "1.2 km" },
];

export const PERKS: { icon: LucideIcon; label: string }[] = [
  { icon: Heart, label: "Wishlist" },
  { icon: Sparkles, label: "MapPoints" },
  { icon: Ticket, label: "Vouchers" },
  { icon: Bell, label: "Order updates" },
];

export const SELLER_TOOLS: IconItem[] = [
  {
    icon: MapPinIcon,
    title: "Pin your location",
    body: "Drop your store's pin on the map during setup.",
  },
  {
    icon: Package,
    title: "Products and stock",
    body: "List items with variants, options, and stock levels.",
  },
  {
    icon: ClipboardCheck,
    title: "Orders and pickup",
    body: "Mark orders ready and hand them over at the counter.",
  },
  {
    icon: Star,
    title: "Reviews",
    body: "See what shoppers say about your store and products.",
  },
  {
    icon: Megaphone,
    title: "Promotions",
    body: "Run promotions that show up for shoppers on the map.",
  },
  {
    icon: Users,
    title: "Your team",
    body: "Invite staff to help run the store.",
  },
];

/** Example order lines that rotate through the seller panel's notification. */
export const SELLER_ORDERS = [
  "Fresh Baguio Carrots (1kg)",
  "Benguet coffee beans",
  "Strawberry jam, 2 jars",
  "Sunflower bouquet",
];

export const FOOTER_COLUMNS: { title: string; links: LinkItem[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "How it works", href: "#how" },
      { label: "Features", href: "#features" },
      { label: "Install the App", href: "#install" },
    ],
  },
  {
    title: "Sell",
    links: [
      { label: "Sell on MapAnytime", href: "/register" },
      { label: "Log in", href: "/login" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Data deletion", href: "/data-deletion" },
    ],
  },
];

export const SOCIAL_LINKS: LinkItem[] = [
  { label: "LinkedIn", href: "https://linkedin.com/company/mapanytime" },
  { label: "Instagram", href: "https://instagram.com/mapanytime" },
  { label: "YouTube", href: "https://youtube.com/@mapanytime" },
];

export const NAV_LINKS: LinkItem[] = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "For sellers", href: "#sellers" },
];
