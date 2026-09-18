import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://mapanytime.com"
  ).replace(/\/+$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/seller/",
        "/buyer/",
        "/agent/",
        "/api/",
        "/checkout/",
        "/orders/",
        "/login",
        "/register",
        "/set-password",
        "/data-deletion",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
