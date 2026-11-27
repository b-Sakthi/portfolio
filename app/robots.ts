import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.siteUrl.replace(/\/$/, "");
  const hostname = new URL(siteConfig.siteUrl).host;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/analytics/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: hostname,
  };
}
