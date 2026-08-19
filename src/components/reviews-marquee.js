"use client";

import { useMemo } from "react";
import CmsText from "@/components/cms-text";
import styles from "./reviews-marquee.module.css";

const YEAR_ROWS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

function reviewYear(review) {
  if (!review?.date) return null;
  const date = new Date(review.date);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCFullYear();
}

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

function YearRow({ year, reviews, reverse, duration }) {
  const loop = useMemo(() => {
    if (!reviews.length) return [];
    const copies = reviews.length < 6 ? 4 : 2;
    return Array.from({ length: copies }, () => reviews).flat();
  }, [reviews]);

  if (!loop.length) return null;

  return (
    <div className={styles.row}>
      <span className={styles.year}>{year}</span>
      <div className={styles.viewport}>
        <div
          className={`${styles.track} ${reverse ? styles.trackReverse : ""}`}
          style={{ animationDuration: `${duration}s` }}
        >
          {loop.map((review, index) => (
            <ReviewCard key={`${year}-${review.id}-${index}`} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ReviewsMarquee({
  reviews = [],
  title = "What Our Guests Say",
  subtitle = "Seven years of stays in the southern Caribbean",
  ariaLabel,
}) {
  const byYear = useMemo(() => {
    const groups = new Map();
    reviews.forEach((review) => {
      const year = reviewYear(review);
      if (!year) return;
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push(review);
    });
    groups.forEach((list) => {
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    return groups;
  }, [reviews]);

  const rows = YEAR_ROWS.filter((year) => (byYear.get(year) || []).length > 0);
  if (!rows.length) return null;

  return (
    <section className={styles.section} aria-label={ariaLabel || "Guest reviews"}>
      <div className={styles.header}>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className={styles.rows}>
        {rows.map((year, index) => (
          <YearRow
            key={year}
            year={year}
            reviews={byYear.get(year)}
            reverse={index % 2 === 1}
            duration={42 + index * 4}
          />
        ))}
      </div>
    </section>
  );
}
