"use client";

import Link from "next/link";
import CmsText from "@/components/cms-text";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { resolveCopy } from "@/lib/cms-field";
import styles from "./blog.module.css";

export default function BlogIndex({ posts, copy }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const title = resolveCopy(copy?.title, t("blog.title"));
  const subtitle = resolveCopy(copy?.subtitle, t("blog.subtitle"));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>
          <CmsText fromCms={title.fromCms}>{title.value}</CmsText>
        </h1>
        <p>
          <CmsText fromCms={subtitle.fromCms}>{subtitle.value}</CmsText>
        </p>
      </header>
      {posts.length === 0 ? (
        <p className={styles.empty}>{t("blog.empty")}</p>
      ) : (
        <div className={styles.grid}>
          {posts.map((post) => (
            <article key={post.slug} className={styles.card}>
              {post.featuredImage && (
                <img src={post.featuredImage} alt="" />
              )}
              <div className={styles.cardBody}>
                <span className={styles.category}>{post.category}</span>
                <h2>
                  <Link href={`/blog/${post.slug}`}>
                    <CmsText fromCms={post.titleFromCms}>{post.title}</CmsText>
                  </Link>
                </h2>
                <p>
                  <CmsText fromCms={post.excerptFromCms}>{post.excerpt}</CmsText>
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
