import type { TourStep } from "@/shared/components/tour/TourOverlay";

// Steps with no matching target on the page are dropped by SellerTourHost, so no permission flags here.

export const WELCOME_TOUR_ID = "welcome";
export const PRODUCTS_TOUR_ID = "products";
export const PROMOTIONS_TOUR_ID = "promotions";

export const sellerWelcomeTourSteps: TourStep[] = [
  // The four dashboard stat cards, one step each.
  {
    id: "stat-sales",
    targetTourId: "stat-sales",
    title: "Money you've made",
    body: "Everything your customers have paid you, added up. It starts at ₱0 and grows with every order you complete.",
  },
  {
    id: "stat-orders",
    targetTourId: "stat-orders",
    title: "Orders to Handle",
    body: "These are orders that need your attention. If the number is above 0, check your orders and take action.",
  },
  {
    id: "stat-completed",
    targetTourId: "stat-completed",
    title: "Completed Orders",
    body: "These are orders your customers have already picked up. Use this to see how many orders you've completed.",
  },
  {
    id: "stat-lowstock",
    targetTourId: "stat-lowstock",
    title: "Products running low",
    body: "Products with 10 or fewer items left will be highlighted so you know they need restocking. Please add more stock before it runs out, because customers won't be able to order the product once the stock reaches zero.",
  },
  {
    id: "stores",
    targetTourId: "store-switcher",
    title: "The store you're working on",
    body: "Everything in this portal applies to the store shown here. If you open more than one store, you'll switch between them from this spot.",
  },
  {
    id: "products",
    targetTourId: "nav-products",
    title: "What you sell",
    body: "Add and edit your products here. A product needs a name, a price, and how many you have. Customers can't buy anything until you've added it.",
  },
  {
    id: "orders",
    targetTourId: "nav-orders",
    title: "Orders coming in",
    body: "When someone buys from you, the order appears here. Move it along the tabs: New, Preparing, Ready for pickup so your customer always knows what's happening.",
  },
  {
    id: "team",
    targetTourId: "nav-team",
    title: "People who help you",
    body: "Invite staff and choose what each person is allowed to see. Useful when someone helps with orders but shouldn't see your earnings.",
  },
];

/** Fires on the first visit to /seller/products. */
export const productsTourSteps: TourStep[] = [
  {
    id: "add-product",
    targetTourId: "add-product",
    title: "Add your first product",
    body: "Start here. You'll add a name, a price, some photos, and how many you have in stock. Pick a store first if this button looks greyed out.",
  },
  {
    id: "stock",
    targetTourId: "stock-column",
    title: "Keeping track of stock",
    body: "This column shows how many of each product you have left. It goes down on its own as orders come in, and your dashboard warns you when something is running low.",
  },
];

/** Runs when the "New promotion" form first opens, not on page load. */
export const promotionsTourSteps: TourStep[] = [
  {
    id: "type",
    targetTourId: "promo-type",
    title: "What are you setting up?",
    body: "Choose what you want to create: a product discount lowers the price of your items, a limited-time event promotes products for a short period, or a job posting advertises an available role at your store. Please choose carefully, as this cannot be changed after the promotion is saved.",
  },
  {
    id: "title",
    targetTourId: "promo-title",
    title: "Give it a headline",
    body: 'This is the line customers actually see, like "Buy 1 take 1 on iced coffee". Short and specific works best.',
  },
  {
    id: "description",
    targetTourId: "promo-description",
    title: "Explain the offer",
    body: "A sentence or two on what's included and anything customers should know, such as which days it runs or a limit per person.",
  },
  {
    id: "salary",
    targetTourId: "promo-salary",
    title: "What the job pays",
    body: 'Optional, but jobs with a pay range listed get far more applicants. A range is fine — something like "₱15,000 - 20,000/mo".',
  },
  {
    id: "discount-type",
    targetTourId: "promo-discount-type",
    title: "How much comes off",
    body: "Choose a percentage, fixed peso amount, or buy-one-get-one discount, then select the products it applies to.",
  },
  {
    id: "products",
    targetTourId: "promo-products",
    title: "Which products it covers",
    body: "Tick the items this applies to. Nothing happens to the products you leave unticked, so you can run an offer on part of your catalogue.",
  },
  {
    id: "schedule",
    targetTourId: "promo-schedule",
    title: "When it runs",
    body: "Set a start and an end and the promotion switches itself on and off for you. Leave both blank and it starts straight away with no end date.",
  },
  {
    id: "submit",
    targetTourId: "promo-submit",
    title: "Save it",
    body: "This creates the promotion. If anything required is missing, the form points it out rather than failing quietly, so you can fix it and save again.",
  },
];
