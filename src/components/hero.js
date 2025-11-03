"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./hero.module.css";

export default function Hero() {
  const heroRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const [imageOffset, setImageOffset] = useState(0);
  const [contentOffset, setContentOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const heroTop = rect.top + window.scrollY;
        const scrollPosition = window.scrollY;
        
        // Only apply parallax when hero is in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const scrolled = scrollPosition - heroTop;
          
          // Image moves right (positive translateX)
          const imageRate = scrolled * 0.5;
          setImageOffset(imageRate);
          
          // Content moves left (negative translateX)
          const contentRate = scrolled * -0.3;
          setContentOffset(contentRate);
        } else {
          // Reset when out of viewport
          setImageOffset(0);
          setContentOffset(0);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className={styles.hero} ref={heroRef}>
      <div className={styles.imageBackground}>
        <div
          className={styles.imageContainer}
          ref={imageRef}
          style={{ transform: `translateX(${imageOffset}px)` }}
        >
          <img
            src="/BannerVilla4.png"
            alt="Caribbean style villa with jungle view"
            className={styles.backgroundImage}
          />
        </div>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.container}>
          <div 
            className={styles.heroContent}
            ref={contentRef}
            style={{ transform: `translateX(${contentOffset}px)` }}
          >
            <h1 className={styles.title}>Blessed House Awaits</h1>
            <p className={styles.subtitle}>
            For guests seeking peace, quiet, and a touch of authentic charm, you have found your haven. Our ideal location ensures effortless exploration of the best of Costa Rica's Southern Caribbean coast.
            </p>
            <div className={styles.cta}>
              <Link href="/villas" className={styles.btnPrimary}>
                Explore Villas
              </Link>
              <Link href="/contact" className={styles.btnSecondary}>
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
