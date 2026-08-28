"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./image-carousel.module.css";

export default function ImageCarousel({
  images = [],
  alt = "",
  className = "",
  onImageClick,
  parallax = false,
}) {
  const pics = (images || []).filter(Boolean);
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const rootRef = useRef(null);
  const current = pics[index] || "/placeholder.svg";

  useEffect(() => {
    if (!parallax || typeof window === "undefined") return undefined;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const node = rootRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const viewport = window.innerHeight || 1;
        const progress = (viewport / 2 - (rect.top + rect.height / 2)) / viewport;
        setOffset(Math.max(-36, Math.min(36, progress * 48)));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [parallax]);

  const media = (
    <div
      className={styles.media}
      style={
        parallax
          ? { transform: `translate3d(0, ${offset}px, 0) scale(1.12)` }
          : undefined
      }
    >
      <img
        src={current}
        alt={alt}
        onClick={() => onImageClick?.(index)}
      />
    </div>
  );

  if (pics.length <= 1) {
    return (
      <div
        ref={rootRef}
        className={`${styles.carousel} ${parallax ? styles.parallax : ""} ${className}`.trim()}
      >
        {media}
        <div className={styles.veil} aria-hidden="true" />
      </div>
    );
  }

  const previous = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIndex((currentIndex) => (currentIndex - 1 + pics.length) % pics.length);
  };

  const next = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIndex((currentIndex) => (currentIndex + 1) % pics.length);
  };

  return (
    <div
      ref={rootRef}
      className={`${styles.carousel} ${parallax ? styles.parallax : ""} ${className}`.trim()}
    >
      {media}
      <div className={styles.veil} aria-hidden="true" />
      <button
        type="button"
        className={`${styles.arrow} ${styles.prev}`}
        onClick={previous}
        aria-label="Previous image"
      >
        ‹
      </button>
      <button
        type="button"
        className={`${styles.arrow} ${styles.next}`}
        onClick={next}
        aria-label="Next image"
      >
        ›
      </button>
      <div className={styles.dots} aria-hidden="true">
        {pics.map((src, dotIndex) => (
          <button
            key={src + dotIndex}
            type="button"
            className={dotIndex === index ? styles.dotActive : styles.dot}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIndex(dotIndex);
            }}
            aria-label={`Image ${dotIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
