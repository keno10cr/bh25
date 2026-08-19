"use client";

import { useState } from "react";
import styles from "./image-carousel.module.css";

export default function ImageCarousel({
  images = [],
  alt = "",
  className = "",
  onImageClick,
}) {
  const pics = (images || []).filter(Boolean);
  const [index, setIndex] = useState(0);
  const current = pics[index] || "/placeholder.svg";

  if (pics.length <= 1) {
    return (
      <div className={`${styles.carousel} ${className}`.trim()}>
        <img
          src={current}
          alt={alt}
          onClick={() => onImageClick?.(0)}
        />
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
    <div className={`${styles.carousel} ${className}`.trim()}>
      <img
        src={current}
        alt={alt}
        onClick={() => onImageClick?.(index)}
      />
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
