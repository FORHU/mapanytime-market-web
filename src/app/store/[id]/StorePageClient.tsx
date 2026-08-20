"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { env } from "@/shared/lib/env";
import { AddToCartButton } from "@/features/cart/components/AddToCartButton";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Users,
  Package,
  Clock,
  ArrowLeft,
  Store,
  ShoppingBag,
  Tag,
  ChevronRight,
  Globe,
  Truck,
  RotateCcw,
  CheckCircle,
  XCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoreHour {
  dayOfWeek: number;
  openMinutes: number;
  closeMinutes: number;
  isClosed: boolean;
}

interface StoreData {
  id: string;
  storeName: string;
  description: string | null;
  slug: string | null;
  phone: string | null;
  email: string | null;
  returnPolicy: string | null;
  shippingPolicy: string | null;
  ratingAverage: number;
  ratingCount: number;
  followersCount: number;
  isActive: boolean;
  vacationMode: boolean;
  categories: { id: string; name: string; parentId: string | null }[];
  storeLocations: {
    currentAddress: string;
    city: string;
    province: string;
    country: string;
    latitude: number;
    longitude: number;
  } | null;
  storeHours: StoreHour[];
}

interface ProductImage {
  file: { path: string };
  isPrimary: boolean;
}

interface Product {
  id: string;
  name: string;
  price: string;
  ratingAverage: number;
  ratingCount: number;
  brand: string | null;
  description: string | null;
  productImages: ProductImage[];
  category: { name: string } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h < 12 ? "AM" : "PM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getTodayStatus(storeHours: StoreHour[]): {
  isOpen: boolean;
  label: string;
} {
  const today = new Date().getDay();
  const todayHours = storeHours.find((h) => h.dayOfWeek === today);
  if (!todayHours || todayHours.isClosed)
    return { isOpen: false, label: "Closed today" };
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isOpen =
    nowMinutes >= todayHours.openMinutes &&
    nowMinutes < todayHours.closeMinutes;
  return {
    isOpen,
    label: isOpen
      ? `Open · Closes ${minutesToTime(todayHours.closeMinutes)}`
      : `Closed · Opens ${minutesToTime(todayHours.openMinutes)}`,
  };
}

const FALLBACK =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80";

// ─── Component ────────────────────────────────────────────────────────────────

export default function StorePageClient({ storeId }: { storeId: string }) {
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [storeRes, productsRes] = await Promise.all([
          fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/stores/${storeId}`),
          fetch(
            `${env.NEXT_PUBLIC_API_URL}/api/v1/stores/${storeId}/products?limit=20`,
          ),
        ]);

        const storeJson = await storeRes.json();
        if (!storeRes.ok)
          throw new Error(storeJson.message || "Store not found");
        setStore(storeJson.data);

        if (productsRes.ok) {
          const pJson = await productsRes.json();
          setProducts(pJson.data?.items ?? []);
        }
      } catch (e: any) {
        setError(e.message || "Failed to load store");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [storeId]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-on-surface-variant">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="font-body text-sm tracking-wide">Loading store…</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !store) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-6">
        <div className="w-20 h-20 rounded-full bg-error-container flex items-center justify-center">
          <Store className="w-10 h-10 text-error" />
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl font-extrabold text-on-surface mb-2">
            Store not found
          </h1>
          <p className="text-on-surface-variant text-sm">{error}</p>
        </div>
        <Link
          href="/#map"
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Map
        </Link>
      </div>
    );
  }

  const parentCategory = store.categories.find((c) => !c.parentId);
  const todayStatus =
    store.storeHours.length > 0 ? getTodayStatus(store.storeHours) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div className="relative h-56 sm:h-72 md:h-80 bg-surface-container overflow-hidden">
        <Image
          src={FALLBACK}
          alt={store.storeName}
          fill
          unoptimized
          className="object-cover"
          priority
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />

        {/* Back button */}
        <Link
          href="/#map"
          id="store-back-btn"
          className="absolute top-5 left-5 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-semibold hover:bg-white/30 transition-colors border border-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Status badge */}
        {store.vacationMode ? (
          <span className="absolute top-5 right-5 px-3 py-1.5 rounded-full bg-amber-400/90 text-amber-900 text-xs font-bold backdrop-blur-md">
            🏖 Vacation Mode
          </span>
        ) : store.isActive ? (
          <span className="absolute top-5 right-5 px-3 py-1.5 rounded-full bg-green-500/90 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Open Now
          </span>
        ) : (
          <span className="absolute top-5 right-5 px-3 py-1.5 rounded-full bg-black/40 text-white text-xs font-bold backdrop-blur-md">
            Closed
          </span>
        )}

        {/* Category chip */}
        {parentCategory && (
          <span className="absolute bottom-24 left-6 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
            {parentCategory.name}
          </span>
        )}

        {/* Store name on hero */}
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-lg">
            {store.storeName}
          </h1>
          {store.storeLocations && (
            <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {store.storeLocations.currentAddress}, {store.storeLocations.city}
            </p>
          )}
        </div>
      </div>

      {/* ── Stats Bar ───────────────────────────────────────────── */}
      <div className="bg-surface border-b border-outline-variant/30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-bold text-on-surface text-sm">
              {store.ratingAverage.toFixed(1)}
            </span>
            <span className="text-on-surface-variant text-xs">
              ({store.ratingCount} reviews)
            </span>
          </div>
          <div className="w-px h-5 bg-outline-variant/40" />
          <div className="flex items-center gap-2 shrink-0">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-on-surface">
              {store.followersCount.toLocaleString()}
            </span>
            <span className="text-on-surface-variant text-xs">followers</span>
          </div>
          <div className="w-px h-5 bg-outline-variant/40" />
          <div className="flex items-center gap-2 shrink-0">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-on-surface">
              {products.length}
            </span>
            <span className="text-on-surface-variant text-xs">products</span>
          </div>
          {todayStatus && (
            <>
              <div className="w-px h-5 bg-outline-variant/40" />
              <div
                className={`flex items-center gap-1.5 shrink-0 text-xs font-semibold ${
                  todayStatus.isOpen
                    ? "text-green-600"
                    : "text-on-surface-variant"
                }`}
              >
                <Clock className="w-4 h-4" />
                {todayStatus.label}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left column: Products ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {store.description && (
            <section>
              <h2 className="font-display text-lg font-bold text-on-surface mb-2">
                About
              </h2>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {store.description}
              </p>
            </section>
          )}

          {/* Products */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Products
              </h2>
            </div>

            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-surface-container-low rounded-2xl border border-outline-variant/20 text-center">
                <Package className="w-12 h-12 text-on-surface-variant opacity-30 mb-3" />
                <p className="text-on-surface-variant text-sm font-medium">
                  No products listed yet
                </p>
                <p className="text-on-surface-variant/60 text-xs mt-1">
                  Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((product) => {
                  const primaryImg = product.productImages?.find(
                    (i) => i.isPrimary,
                  );
                  const imgUrl = primaryImg?.file?.path ?? FALLBACK;
                  return (
                    <div
                      key={product.id}
                      id={`product-${product.id}`}
                      className="group bg-surface rounded-2xl overflow-hidden border border-outline-variant/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                    >
                      <div className="relative h-40 bg-surface-container overflow-hidden">
                        <Image
                          src={imgUrl}
                          alt={product.name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.category && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-semibold backdrop-blur-sm flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {product.category.name}
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-on-surface text-sm leading-snug line-clamp-2 mb-1">
                          {product.name}
                        </p>
                        {product.brand && (
                          <p className="text-on-surface-variant text-xs mb-1.5">
                            {product.brand}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="font-display font-extrabold text-primary text-base">
                            ₱{Number(product.price).toLocaleString()}
                          </span>
                          {product.ratingCount > 0 && (
                            <span className="flex items-center gap-1 text-xs text-amber-500">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {product.ratingAverage.toFixed(1)}
                            </span>
                          )}
                        </div>

                        <AddToCartButton
                          storeId={storeId}
                          productId={product.id}
                          productName={product.name}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-5">
          {/* Contact Info */}
          <div className="bg-surface rounded-2xl border border-outline-variant/20 p-5 space-y-4">
            <h3 className="font-display font-bold text-on-surface text-sm uppercase tracking-wider">
              Contact & Location
            </h3>
            {store.storeLocations && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="text-on-surface-variant leading-snug">
                  <p>{store.storeLocations.currentAddress}</p>
                  <p>
                    {store.storeLocations.city}, {store.storeLocations.province}
                  </p>
                  <p>{store.storeLocations.country}</p>
                </div>
              </div>
            )}
            {store.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a
                  href={`tel:${store.phone}`}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  {store.phone}
                </a>
              </div>
            )}
            {store.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a
                  href={`mailto:${store.email}`}
                  className="text-on-surface-variant hover:text-primary transition-colors truncate"
                >
                  {store.email}
                </a>
              </div>
            )}
            {store.storeLocations && (
              <a
                href={`https://www.google.com/maps?q=${store.storeLocations.latitude},${store.storeLocations.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full mt-1 py-2.5 rounded-xl border border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-colors"
              >
                <Globe className="w-4 h-4" />
                Open in Maps
              </a>
            )}
          </div>

          {/* Store Hours */}
          {store.storeHours.length > 0 && (
            <div className="bg-surface rounded-2xl border border-outline-variant/20 p-5">
              <h3 className="font-display font-bold text-on-surface text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Store Hours
              </h3>
              <div className="space-y-2">
                {DAYS.map((day, i) => {
                  const hours = store.storeHours.find((h) => h.dayOfWeek === i);
                  const isToday = new Date().getDay() === i;
                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-between text-xs py-1 px-2 rounded-lg ${
                        isToday
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-on-surface-variant"
                      }`}
                    >
                      <span className="font-semibold w-9">{day}</span>
                      {hours ? (
                        hours.isClosed ? (
                          <span className="text-error font-semibold">
                            Closed
                          </span>
                        ) : (
                          <span>
                            {minutesToTime(hours.openMinutes)} –{" "}
                            {minutesToTime(hours.closeMinutes)}
                          </span>
                        )
                      ) : (
                        <span className="opacity-40">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Policies */}
          {(store.returnPolicy || store.shippingPolicy) && (
            <div className="bg-surface rounded-2xl border border-outline-variant/20 p-5 space-y-4">
              <h3 className="font-display font-bold text-on-surface text-sm uppercase tracking-wider">
                Store Policies
              </h3>
              {store.shippingPolicy && (
                <div className="flex items-start gap-3 text-sm">
                  <Truck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-on-surface text-xs mb-0.5">
                      Shipping
                    </p>
                    <p className="text-on-surface-variant text-xs leading-relaxed">
                      {store.shippingPolicy}
                    </p>
                  </div>
                </div>
              )}
              {store.returnPolicy && (
                <div className="flex items-start gap-3 text-sm">
                  <RotateCcw className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-on-surface text-xs mb-0.5">
                      Returns
                    </p>
                    <p className="text-on-surface-variant text-xs leading-relaxed">
                      {store.returnPolicy}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Categories */}
          {store.categories.length > 0 && (
            <div className="bg-surface rounded-2xl border border-outline-variant/20 p-5">
              <h3 className="font-display font-bold text-on-surface text-sm uppercase tracking-wider mb-3">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {store.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-semibold"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
