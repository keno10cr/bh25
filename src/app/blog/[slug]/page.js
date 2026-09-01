import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogSlugs } from "@/lib/sanity/content";
import { blogImageAlt } from "@/lib/blog-image-alt";
import { SITE_NAME, SITE_URL } from "@/lib/siteMetadata";
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

  const imageAlt = blogImageAlt({
    alt: post.featuredImageAlt,
    title: post.title,
    category: post.category,
    slug: post.slug,
  });
  const pageUrl = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: `${post.title} | Blessed House Blog`,
    description: post.excerpt,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "article",
      url: pageUrl,
      siteName: SITE_NAME,
      title: `${post.title} | ${SITE_NAME}`,
      description: post.excerpt,
      images: post.featuredImage
        ? [{ url: post.featuredImage, alt: imageAlt }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | ${SITE_NAME}`,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();
  return <BlogArticle post={post} />;
}
