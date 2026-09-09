"use client";

import { useEffect, useRef, useState } from "react";
import { useSmoothParallax } from "@/lib/parallax-motion";
import styles from "./image-carousel.module.css";

export default function ImageCarousel({
  images = [],
  alt = "",
  className = "",
  onImageClick,
  parallax = false,
  controlsPlacement = "overlay",
}) {
  const pics = (images || []).filter(Boolean);
  const [index, setIndex] = useState(0);
  const rootRef = useRef(null);
  const mediaRef = useRef(null);
  const current = pics[index] || "/placeholder.svg";
  const below = controlsPlacement === "below";

  useSmoothParallax((loop) => {
    if (!parallax) return;
    const node = rootRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const progress =
      (viewport / 2 - (rect.top + rect.height / 2)) / viewport;
    const offset = Math.max(-36, Math.min(36, progress * 48));
    loop.set(mediaRef.current, { y: offset, lerp: 0.2 });
  }, [parallax]);

  useEffect(() => {
    const refresh = () => {
      const img = mediaRef.current?.querySelector("img");
      if (!img) return;
      if (!img.complete || img.naturalWidth === 0) {
        const src = img.getAttribute("src");
        if (src) {
          img.setAttribute("src", src);
        }
      }
    };
    window.addEventListener("pageshow", refresh);
    return () => window.removeEventListener("pageshow", refresh);
  }, [current]);

  const media = (
    <div ref={mediaRef} className={styles.media}>
      <img
        key={current}
        src={current}
        alt={alt}
        loading="eager"
        decoding="async"
        onClick={() => onImageClick?.(index)}
      />
    </div>
  );

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

  const dots = pics.map((src, dotIndex) => (
    <button
      key={src + dotIndex}
      type="button"
      className={
        below
          ? dotIndex === index
            ? styles.dotBelowActive
            : styles.dotBelow
          : dotIndex === index
            ? styles.dotActive
            : styles.dot
      }
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setIndex(dotIndex);
      }}
      aria-label={`Image ${dotIndex + 1}`}
    />
  ));

  const stage = (
    <div
      ref={rootRef}
      className={`${styles.carousel} ${parallax ? styles.parallax : ""} ${className}`.trim()}
    >
      {media}
      {below ? null : <div className={styles.veil} aria-hidden="true" />}
      {!below && pics.length > 1 ? (
        <>
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
            {dots}
          </div>
        </>
      ) : null}
    </div>
  );

  if (!below) {
    return stage;
  }

  return (
    <div className={styles.bundle}>
      {stage}
      {pics.length > 1 ? (
        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.arrowBelow}
            onClick={previous}
            aria-label="Previous image"
          >
            ‹
          </button>
          <div className={styles.dotsBelow}>{dots}</div>
          <button
            type="button"
            className={styles.arrowBelow}
            onClick={next}
            aria-label="Next image"
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}
