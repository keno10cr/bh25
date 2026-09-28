"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import PortableBody from "@/components/portable-text";
import CmsText from "@/components/cms-text";
import VillaGalleryModal from "@/components/villa-gallery-modal";
import { localizedField } from "@/lib/localized";
import { blogImageAlt } from "@/lib/blog-image-alt";
import styles from "../blog.module.css";

function sanityThumb(url, width) {
  return url.includes("cdn.sanity.io") ? `${url}?w=${width}&auto=format` : url;
}

export default function BlogArticle({ post }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [galleryIndex, setGalleryIndex] = useState(null);
  const title = localizedField(post, "title", language);
  const content = localizedField(post, "content", language) || post.content;
  const published = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(language, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const photoAlt = blogImageAlt({
    alt: "",
    title,
    category: post.category,
    slug: post.slug,
    kind: "photo",
  });
  const heroAlt = blogImageAlt({
    alt: post.featuredImageAlt,
    title,
    category: post.category,
    slug: post.slug,
  });

  const galleryPhotos = post.gallery || [];
  const slides = useMemo(() => {
    const list = [];
    if (post.featuredImage) list.push({ url: post.featuredImage, caption: heroAlt });
    galleryPhotos.forEach((image) =>
      list.push({ url: image.url, caption: image.alt || photoAlt })
    );
    return list;
  }, [post.featuredImage, galleryPhotos, heroAlt, photoAlt]);
  const galleryOffset = post.featuredImage ? 1 : 0;
  const hasGallery = galleryPhotos.length > 0;

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
      {post.featuredImage &&
        (hasGallery ? (
          <button
            type="button"
            className={styles.heroButton}
            onClick={() => setGalleryIndex(0)}
            aria-label={t("blog.openPhoto")
              .replace("{n}", "1")
              .replace("{total}", String(slides.length))}
          >
            <img src={post.featuredImage} alt={heroAlt} className={styles.hero} />
          </button>
        ) : (
          <img src={post.featuredImage} alt={heroAlt} className={styles.hero} />
        ))}
      <PortableBody value={content} imageAlt={photoAlt} />
      {hasGallery && (
        <section className={styles.gallerySection} aria-label={t("blog.gallery")}>
          <h2 className={styles.galleryTitle}>{t("blog.gallery")}</h2>
          <div className={styles.gallery}>
            {galleryPhotos.map((image, index) => {
              const slideIndex = index + galleryOffset;
              return (
                <button
                  key={image.url}
                  type="button"
                  className={styles.galleryItem}
                  onClick={() => setGalleryIndex(slideIndex)}
                  aria-label={t("blog.openPhoto")
                    .replace("{n}", String(slideIndex + 1))
                    .replace("{total}", String(slides.length))}
                >
                  <img
                    src={sanityThumb(image.url, 600)}
                    alt={image.alt || photoAlt}
                    loading={index < 4 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </button>
              );
            })}
          </div>
        </section>
      )}
      <p className={styles.author}>
        <span>{t("blog.authorLabel")}</span>
        {t("blog.author")}
      </p>
      <VillaGalleryModal
        villa={{ name: title }}
        images={slides.map((slide) => sanityThumb(slide.url, 1600))}
        captions={slides.map((slide) => slide.caption)}
        startIndex={galleryIndex ?? 0}
        isOpen={galleryIndex !== null}
        onClose={() => setGalleryIndex(null)}
      />
    </article>
  );
}
