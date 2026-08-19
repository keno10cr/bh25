"use client";

import { useMemo } from "react";
import CmsText from "@/components/cms-text";
import styles from "./reviews-marquee.module.css";

const ROW_COUNT = 3;

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

function ReviewRow({ reviews, reverse, duration, rowKey }) {
  const loop = useMemo(() => {
    if (!reviews.length) return [];
    const copies = reviews.length < 6 ? 4 : 2;
    return Array.from({ length: copies }, () => reviews).flat();
  }, [reviews]);

  if (!loop.length) return null;

  return (
    <div className={styles.viewport}>
      <div
        className={`${styles.track} ${reverse ? styles.trackReverse : ""}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {loop.map((review, index) => (
          <ReviewCard key={`${rowKey}-${review.id}-${index}`} review={review} />
        ))}
      </div>
    </div>
  );
}

function splitIntoRows(reviews, rows) {
  const sorted = [...reviews].sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
  );
  const groups = Array.from({ length: rows }, () => []);
  sorted.forEach((review, index) => {
    groups[index % rows].push(review);
  });
  return groups.filter((group) => group.length > 0);
}

export default function ReviewsMarquee({
  reviews = [],
  title = "What Our Guests Say",
  subtitle = "Stories from stays in the southern Caribbean",
  ariaLabel,
}) {
  const rows = useMemo(() => splitIntoRows(reviews, ROW_COUNT), [reviews]);
  if (!rows.length) return null;

  return (
    <section className={styles.section} aria-label={ariaLabel || "Guest reviews"}>
      <div className={styles.header}>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className={styles.rows}>
        {rows.map((rowReviews, index) => (
          <ReviewRow
            key={index}
            rowKey={index}
            reviews={rowReviews}
            reverse={index % 2 === 1}
            duration={44 + index * 6}
          />
        ))}
      </div>
    </section>
  );
}
