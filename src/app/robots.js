export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/ccen", "/cces", "/bhgr", "/tool-access"],
    },
    sitemap: "https://www.blessedhouse.info/sitemap.xml",
  };
}
