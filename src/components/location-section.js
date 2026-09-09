"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import CmsText from "@/components/cms-text";
import { resolveCopy } from "@/lib/cms-field";
import { useSmoothParallax } from "@/lib/parallax-motion";
import styles from "./location-section.module.css";

export default function LocationSection({ copy }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const title = resolveCopy(copy?.locationTitle, t("location.title"), language);
  const description = resolveCopy(
    copy?.locationDescription,
    t("location.description"),
    language
  );
  const mapsInfo = resolveCopy(
    copy?.locationMapsInfo,
    t("location.mapsInfo"),
    language
  );
  const mapsQuery = resolveCopy(
    copy?.locationMapsQuery,
    "Blessed House Puerto Viejo de Talamanca",
    language
  );
  const cta = resolveCopy(copy?.locationCta, t("location.contactUs"), language);
  const imageRef = useRef(null);
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const textContentRef = useRef(null);
  const intervalRef = useRef(null);
  const observerRef = useRef(null);
  const hasAnimatedRef = useRef(false);
  const [visibleChars, setVisibleChars] = useState(0);
  const parallaxUpdateRef = useRef(() => {});

  const fullText = `"${mapsQuery.value}"`;
  const totalChars = fullText.length;

  useSmoothParallax((loop) => {
    const getCenterOffset = () => {
      const band = sectionRef.current;
      const image = imageRef.current;
      if (!band || !image) return 0;
      return (band.offsetHeight - image.offsetHeight) / 2;
    };

    const apply = () => {
      if (window.innerWidth <= 768) {
        loop.set(imageRef.current, { y: 0, lerp: 0.22 });
        loop.set(textContentRef.current, { x: 0, lerp: 0.22 });
        return;
      }
      const centerOffset = getCenterOffset();
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const scrolled = -rect.top;
        loop.set(imageRef.current, {
          y: centerOffset + scrolled * 0.28,
          lerp: 0.16,
        });
        loop.set(textContentRef.current, {
          x: 100 - scrolled * 0.45,
          lerp: 0.14,
        });
      } else {
        loop.set(imageRef.current, { y: centerOffset, lerp: 0.18 });
        loop.set(textContentRef.current, { x: 0, lerp: 0.18 });
      }
    };

    parallaxUpdateRef.current = apply;
    apply();
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
        >
          <img
            src={copy?.locationImage?.value || "/info/locationBHmap.jpg"}
            alt={
              copy?.locationImageAlt?.value ||
              "Satellite map of Blessed House near Puerto Viejo de Talamanca, Playa Cocles, and Punta Uva"
            }
            className={styles.image}
            onLoad={() => parallaxUpdateRef.current()}
          />
        </div>
      </div>
      <div className={styles.content}>
        <div 
          className={styles.textContent}
          ref={textContentRef}
        >
          <h2>
            <CmsText fromCms={title.fromCms}>{title.value}</CmsText>
          </h2>
          <p>
            <CmsText fromCms={description.fromCms}>{description.value}</CmsText>
          </p>
          <p className={styles.mapsInfo}>
            <CmsText fromCms={mapsInfo.fromCms}>{mapsInfo.value}</CmsText>
          </p>
          <p
            className={`${styles.mapsQuery}${
              mapsQuery.fromCms ? "" : " cms-fallback"
            }`}
            ref={textRef}
          >
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
            <CmsText fromCms={cta.fromCms}>{cta.value}</CmsText>
          </Link>
        </div>
      </div>
    </section>
  );
}
