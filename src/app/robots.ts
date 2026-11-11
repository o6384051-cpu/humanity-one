import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/settings/"],
    },
    sitemap: "https://humanity-one-wc35.vercel.app/sitemap.xml",
    host: "https://humanity-one-wc35.vercel.app",
  };
}
