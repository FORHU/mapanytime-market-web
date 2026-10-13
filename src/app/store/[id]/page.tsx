import { Metadata } from "next";
import { notFound } from "next/navigation";
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

function buildJsonLd(
  store: any,
  siteUrl: string,
  storeId: string,
  ogImageUrl: string,
) {
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

  const canonicalUrl = `${siteUrl}/store/${encodeURIComponent(store.slug || storeId)}`;

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${canonicalUrl}#store`,
    name: store.storeName,
    url: canonicalUrl,
    image: ogImageUrl,
    description: store.description || undefined,
    telephone: store.phone || undefined,
    email: store.email || undefined,
    address,
    geo,
    openingHoursSpecification: openingHours?.length ? openingHours : undefined,
  };

  if (
    typeof store.ratingCount === "number" &&
    store.ratingCount > 0 &&
    typeof store.ratingAverage === "number" &&
    store.ratingAverage > 0
  ) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: store.ratingAverage,
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

  if (!store) {
    return {
      title: "Store Not Found | MapAnytime",
      description: "The requested store is not available on MapAnytime.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const storeSlug = store.slug?.trim() || store.id || id;
  const canonicalUrl = `${siteUrl}/store/${encodeURIComponent(storeSlug)}`;

  const location = Array.isArray(store.storeLocations)
    ? store.storeLocations[0]
    : store.storeLocations;

  const locationName = [location?.city, location?.province]
    .filter(Boolean)
    .join(", ");

  const title = locationName
    ? `${store.storeName} — ${locationName} | MapAnytime`
    : `${store.storeName} — MapAnytime`;

  const description =
    store.description?.trim() ||
    `Discover ${store.storeName}${locationName ? ` in ${locationName}` : ""}, view available products, and see pickup information on MapAnytime.`;

  const ogImageUrl =
    store.bannerUrl || store.logoUrl || `${siteUrl}/og-image.png`;

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
          url: ogImageUrl,
          alt: store.storeName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function StorePage({ params }: Props) {
  const { id } = await params;
  const store = await getStore(id);

  if (!store) {
    notFound();
  }

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://mapanytime.com"
  ).replace(/\/+$/, "");
  const ogImageUrl =
    store.bannerUrl || store.logoUrl || `${siteUrl}/og-image.png`;
  const jsonLd = buildJsonLd(store, siteUrl, id, ogImageUrl);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <StorePageClient storeId={store.id} />
    </>
  );
}
