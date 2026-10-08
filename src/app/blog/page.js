import { getBlogPageSettings, getBlogPosts } from "@/lib/sanity/content";
import BlogIndex from "./blog-index";

export const revalidate = 60;

export const metadata = {
  title: "Blog, Puerto Viejo Travel Notes",
  description:
    "Flora, fauna, local spots, and retreat notes from Puerto Viejo and Blessed House.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const [posts, copy] = await Promise.all([
    getBlogPosts(),
    getBlogPageSettings(),
  ]);
  return <BlogIndex posts={posts} copy={copy} />;
}
