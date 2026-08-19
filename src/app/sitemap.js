import { getActivitySlugs, getBlogSlugs, getVillaSlugs } from "@/lib/sanity/content";

const SITE_URL = "https://www.blessedhouse.info";

export default async function sitemap() {
  const [villaSlugs, blogSlugs, activitySlugs] = await Promise.all([
    getVillaSlugs(),
    getBlogSlugs(),
    getActivitySlugs(),
  ]);

  const staticRoutes = [
    "",
    "/activities",
    "/gallery",
    "/villas",
    "/contact",
    "/blog",
    "/welcome",
  ].map((path) => ({
    url: `${SITE_URL}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const villaRoutes = villaSlugs.map((slug) => ({
    url: `${SITE_URL}/villas/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogRoutes = blogSlugs.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const activityRoutes = activitySlugs.map((slug) => ({
    url: `${SITE_URL}/activities/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...villaRoutes, ...blogRoutes, ...activityRoutes];
}
