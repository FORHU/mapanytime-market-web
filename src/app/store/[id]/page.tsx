import { Metadata } from "next";
import StorePageClient from "./StorePageClient";

interface Props {
  params: Promise<{ id: string }>;
}

async function getStore(id: string) {
  try {
    const apiBase = (
      process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4002"
    ).replace(/\/+$/, "");
    const res = await fetch(
      `${apiBase}/api/v1/stores/${encodeURIComponent(id)}`,
      {
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

const DAY_MAP: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

function toHHMM(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function buildJsonLd(store: any, siteUrl: string, storeId: string) {
  const location = Array.isArray(store.storeLocations)
    ? store.storeLocations[0]
    : store.storeLocations;

  const openingHours = Array.isArray(store.storeHours)
    ? store.storeHours
        .filter(
          (h: any) =>
            !h.isClosed &&
            typeof h.openMinutes === "number" &&
            typeof h.closeMinutes === "number",
        )
        .map((h: any) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: DAY_MAP[h.dayOfWeek] || "Monday",
          opens: toHHMM(h.openMinutes),
          closes: toHHMM(h.closeMinutes),
        }))
    : undefined;

  const address = location
    ? {
        "@type": "PostalAddress",
        streetAddress: location.currentAddress || undefined,
        addressLocality: location.city || undefined,
        addressRegion: location.province || undefined,
        postalCode: location.zipCode ? String(location.zipCode) : undefined,
        addressCountry: location.country || "PH",
      }
    : undefined;

  const geo =
    location?.latitude && location?.longitude
      ? {
          "@type": "GeoCoordinates",
          latitude: location.latitude,
          longitude: location.longitude,
        }
      : undefined;

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${siteUrl}/store/${encodeURIComponent(store.slug || storeId)}#store`,
    name: store.storeName,
    url: `${siteUrl}/store/${encodeURIComponent(store.slug || storeId)}`,
    description: store.description || undefined,
    telephone: store.phone || undefined,
    email: store.email || undefined,
    address,
    geo,
    openingHoursSpecification: openingHours?.length ? openingHours : undefined,
    priceRange: "$$",
  };

  if (store.ratingCount && store.ratingCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: store.ratingAverage || 5,
      reviewCount: store.ratingCount,
    };
  }

  return jsonLd;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const store = await getStore(id);
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://mapanytime.com"
  ).replace(/\/+$/, "");
  const canonicalUrl = `${siteUrl}/store/${encodeURIComponent(store?.slug || id)}`;

  if (!store) {
    return {
      title: "Store",
      description: "Discover local stores and offline merchants on MapAnytime.",
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  const location = Array.isArray(store.storeLocations)
    ? store.storeLocations[0]
    : store.storeLocations;

  const locationName = [location?.city, location?.province]
    .filter(Boolean)
    .join(", ");
  const title = locationName
    ? `${store.storeName} — ${locationName} | MapAnytime`
    : `${store.storeName} | MapAnytime`;

  const description =
    store.description?.trim() ||
    `Visit ${store.storeName}${locationName ? ` in ${locationName}` : ""}. Browse products, view live operating hours, and order for direct pickup on MapAnytime.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "MapAnytime",
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: store.storeName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default async function StorePage({ params }: Props) {
  const { id } = await params;
  const store = await getStore(id);
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://mapanytime.com"
  ).replace(/\/+$/, "");
  const jsonLd = store ? buildJsonLd(store, siteUrl, id) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <StorePageClient storeId={id} />
    </>
  );
}
