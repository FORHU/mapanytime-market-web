import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://mapanytime.com"
  ).replace(/\/+$/, "");
  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4002"
  ).replace(/\/+$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  try {
    const res = await fetch(`${apiUrl}/api/v1/stores/public-sitemap`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return staticRoutes;

    const json = await res.json();
    const stores: Array<{
      id: string;
      slug?: string | null;
      updatedAt: string;
    }> = json?.data || [];

    const storeRoutes: MetadataRoute.Sitemap = stores.map((store) => ({
      url: `${baseUrl}/store/${encodeURIComponent(store.slug || store.id)}`,
      lastModified: new Date(store.updatedAt),
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    return [...staticRoutes, ...storeRoutes];
  } catch {
    return staticRoutes;
  }
}
