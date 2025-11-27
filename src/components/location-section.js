"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./location-section.module.css";

export default function LocationSection() {
  const imageRef = useRef(null);
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const textContentRef = useRef(null);
  const intervalRef = useRef(null);
  const observerRef = useRef(null);
  const hasAnimatedRef = useRef(false);
  const [imageOffset, setImageOffset] = useState(0);
  const [contentOffset, setContentOffset] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);

  const fullText = '"Blessed House Puerto Viejo de Talamanca"';
  const totalChars = fullText.length;

  useEffect(() => {
    const handleScroll = () => {
      // Only apply parallax on desktop (above 768px)
      if (window.innerWidth <= 768) {
        setImageOffset(0);
        setContentOffset(0);
        return;
      }

      if (sectionRef.current && imageRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const scrollPosition = window.scrollY;
        
        // Only apply parallax when section is in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const scrolled = scrollPosition - sectionTop;
          
          // Image moves down as we scroll down
          const rate = scrolled * 0.3;
          setImageOffset(rate);
          
          // Content appears from the right and moves left as we scroll down
          // Start with positive offset (off to the right), then move left
          const initialOffset = 100; // Start 100px to the right
          const contentRate = initialOffset - (scrolled * 0.5);
          setContentOffset(contentRate);
        } else {
          // Reset when out of viewport
          setImageOffset(0);
          setContentOffset(0);
        }
      }
    };

    const handleResize = () => {
      // Reset offsets on resize if mobile
      if (window.innerWidth <= 768) {
        setImageOffset(0);
        setContentOffset(0);
      }
      handleScroll();
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    handleScroll(); // Call once on mount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!textRef.current) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            // Clear any existing interval
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            
            // Reset and start animation
            setVisibleChars(0);
            hasAnimatedRef.current = true;
            
            const duration = 4000; // 4 seconds
            const interval = duration / totalChars;
            
            let currentChar = 0;
            intervalRef.current = setInterval(() => {
              currentChar++;
              setVisibleChars((prev) => {
                if (currentChar >= totalChars) {
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                  }
                }
                return currentChar;
              });
            }, interval);
          } else if (!entry.isIntersecting) {
            // Reset when out of view - hide text and reset animation state
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setVisibleChars(0);
            hasAnimatedRef.current = false;
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    observerRef.current.observe(textRef.current);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [totalChars]);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.imageBackground}>
        <div 
          className={styles.imageContainer}
          ref={imageRef}
          style={{ transform: `translateY(${imageOffset}px)` }}
        >
          <img
            src="/info/locationBHmap.jpg"
            alt="Location map"
            className={styles.image}
          />
        </div>
      </div>
      <div className={styles.content}>
        <div 
          className={styles.textContent}
          ref={textContentRef}
          style={{ transform: `translateX(${contentOffset}px)` }}
        >
          <h2>Location</h2>
          <p>
            From the crossroad at Hone Creek, keep on straight towards Puerto Viejo for 2.5kms, our entrance is on the right side of the road.
          </p>
          <p className={styles.mapsInfo}>
            You can find us Google Maps:
          </p>
          <p className={styles.mapsQuery} ref={textRef}>
            {fullText.split("").map((char, index) => (
              <span
                key={index}
                className={styles.char}
                style={{
                  opacity: index < visibleChars ? 1 : 0,
                  transition: "opacity 0.1s ease-in",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </p>
          <Link href="/contact" className={styles.ctaButton}>
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
