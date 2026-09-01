"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import PortableBody from "@/components/portable-text";
import CmsText from "@/components/cms-text";
import { localizedField } from "@/lib/localized";
import { blogImageAlt } from "@/lib/blog-image-alt";
import styles from "../blog.module.css";

export default function BlogArticle({ post }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const title = localizedField(post, "title", language);
  const content = localizedField(post, "content", language) || post.content;
  const published = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(language, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <article className={styles.article}>
      <div className={styles.articleTop}>
        <Link href="/blog" className={styles.back}>
          ← {t("blog.back")}
        </Link>
        <span className={styles.category}>{post.category}</span>
      </div>
      <h1>
        <CmsText fromCms={Boolean(title)}>{title}</CmsText>
      </h1>
      {published && (
        <p className={styles.meta}>
          {t("blog.published")} {published}
        </p>
      )}
      {post.featuredImage && (
        <img
          src={post.featuredImage}
          alt={blogImageAlt({
            alt: post.featuredImageAlt,
            title,
            category: post.category,
            slug: post.slug,
          })}
          className={styles.hero}
        />
      )}
      <PortableBody
        value={content}
        imageAlt={blogImageAlt({
          alt: "",
          title,
          category: post.category,
          slug: post.slug,
          kind: "photo",
        })}
      />
      <p className={styles.author}>
        <span>{t("blog.authorLabel")}</span>
        {t("blog.author")}
      </p>
    </article>
  );
}
