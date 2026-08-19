"use client";

import { useMemo } from "react";
import CmsText from "@/components/cms-text";
import styles from "./reviews-marquee.module.css";

function formatReviewDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function Stars({ rating }) {
  const score = Math.max(1, Math.min(5, Number(rating) || 5));
  return (
    <span className={styles.stars} aria-label={`${score} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={index < score ? styles.starOn : styles.starOff}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function ReviewCard({ review }) {
  return (
    <article className={styles.card}>
      <Stars rating={review.rating} />
      <div className={styles.meta}>
        <strong>
          <CmsText fromCms={review.fromCms}>{review.guestName}</CmsText>
        </strong>
        <span>{formatReviewDate(review.date)}</span>
      </div>
      <p>
        <CmsText fromCms={review.fromCms}>{review.comment}</CmsText>
      </p>
    </article>
  );
}

export default function ReviewsMarquee({
  reviews = [],
  title = "What Our Guests Say",
  subtitle = "Stories from stays in the southern Caribbean",
  ariaLabel,
}) {
  const loop = useMemo(() => {
    const source = reviews.length ? reviews : [];
    if (!source.length) return [];
    return [...source, ...source];
  }, [reviews]);

  if (!loop.length) return null;

  return (
    <section className={styles.section} aria-label={ariaLabel || "Guest reviews"}>
      <div className={styles.header}>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className={styles.viewport}>
        <div className={styles.track}>
          {loop.map((review, index) => (
            <ReviewCard key={`${review.id}-${index}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
