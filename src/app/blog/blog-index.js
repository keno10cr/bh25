"use client";

import Link from "next/link";
import CmsText from "@/components/cms-text";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { resolveCopy } from "@/lib/cms-field";
import { localizedField } from "@/lib/localized";
import { blogImageAlt } from "@/lib/blog-image-alt";
import styles from "./blog.module.css";

export default function BlogIndex({ posts, copy }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const title = resolveCopy(copy?.title, t("blog.title"), language);
  const subtitle = resolveCopy(copy?.subtitle, t("blog.subtitle"), language);

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
          {posts.map((post) => {
            const postTitle = localizedField(post, "title", language);
            const postExcerpt = localizedField(post, "excerpt", language);
            return (
              <article key={post.slug} className={styles.card}>
                {post.featuredImage && (
                  <img
                    src={post.featuredImage}
                    alt={blogImageAlt({
                      alt: post.featuredImageAlt,
                      title: postTitle,
                      category: post.category,
                      slug: post.slug,
                    })}
                  />
                )}
                <div className={styles.cardBody}>
                  <span className={styles.category}>{post.category}</span>
                  <h2>
                    <Link href={`/blog/${post.slug}`}>
                      <CmsText fromCms={Boolean(postTitle)}>
                        {postTitle}
                      </CmsText>
                    </Link>
                  </h2>
                  <p>
                    <CmsText fromCms={Boolean(postExcerpt)}>
                      {postExcerpt}
                    </CmsText>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
