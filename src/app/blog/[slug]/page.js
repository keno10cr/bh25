import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogSlugs } from "@/lib/sanity/content";
import BlogArticle from "./article";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Story not found" };
  return {
    title: `${post.title} | Blessed House Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();
  return <BlogArticle post={post} />;
}
