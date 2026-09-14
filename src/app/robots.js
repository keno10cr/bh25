export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/ccen", "/cces"],
    },
    sitemap: "https://www.blessedhouse.info/sitemap.xml",
  };
}
