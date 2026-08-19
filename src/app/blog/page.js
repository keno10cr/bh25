import { getBlogPageSettings, getBlogPosts } from "@/lib/sanity/content";
import BlogIndex from "./blog-index";

export const revalidate = 60;

export const metadata = {
  title: "Blog | Blessed House Villas",
  description:
    "Flora, fauna, local spots, and retreat notes from Puerto Viejo and Blessed House.",
};

export default async function BlogPage() {
  const [posts, copy] = await Promise.all([
    getBlogPosts(),
    getBlogPageSettings(),
  ]);
  return <BlogIndex posts={posts} copy={copy} />;
}
