"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import CmsText from "@/components/cms-text";
import { resolveCopy } from "@/lib/cms-field";
import styles from "./hero.module.css";

export default function Hero({ copy }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
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
            src="/BannerVilla4.jpg"
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
            <h1 className={styles.title}>
              {(() => {
                const title = resolveCopy(copy?.heroTitle, t("hero.title"));
                if (title.value.includes("Blessed House")) {
                  const parts = title.value.split("Blessed House");
                  return (
                    <CmsText fromCms={title.fromCms}>
                      Blessed House<br />
                      {parts[1]}
                    </CmsText>
                  );
                }
                return (
                  <CmsText fromCms={title.fromCms}>{title.value}</CmsText>
                );
              })()}
            </h1>
            <p className={styles.subtitle}>
              <CmsText
                fromCms={resolveCopy(copy?.heroSubtitle, t("hero.subtitle")).fromCms}
              >
                {resolveCopy(copy?.heroSubtitle, t("hero.subtitle")).value}
              </CmsText>
            </p>
            <div className={styles.cta}>
              <Link href="/villas" className={styles.btnPrimary}>
                <CmsText
                  fromCms={
                    resolveCopy(copy?.heroCtaPrimary, t("hero.exploreVillas"))
                      .fromCms
                  }
                >
                  {resolveCopy(copy?.heroCtaPrimary, t("hero.exploreVillas")).value}
                </CmsText>
              </Link>
              <Link href="/contact" className={styles.btnSecondary}>
                <CmsText
                  fromCms={
                    resolveCopy(copy?.heroCtaSecondary, t("hero.getInTouch"))
                      .fromCms
                  }
                >
                  {resolveCopy(copy?.heroCtaSecondary, t("hero.getInTouch")).value}
                </CmsText>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
