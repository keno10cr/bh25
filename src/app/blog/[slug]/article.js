"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import PortableBody from "@/components/portable-text";
import CmsText from "@/components/cms-text";
import styles from "../blog.module.css";

export default function BlogArticle({ post }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
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
        <CmsText fromCms={post.titleFromCms}>{post.title}</CmsText>
      </h1>
      {published && (
        <p className={styles.meta}>
          {t("blog.published")} {published}
        </p>
      )}
      {post.featuredImage && (
        <img src={post.featuredImage} alt="" className={styles.hero} />
      )}
      <PortableBody value={post.content} />
      <p className={styles.author}>
        <span>{t("blog.authorLabel")}</span>
        {t("blog.author")}
      </p>
    </article>
  );
}
