"use client";

import { useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import CmsText from "@/components/cms-text";
import { resolveCopy } from "@/lib/cms-field";
import { useSmoothParallax } from "@/lib/parallax-motion";
import styles from "./hero.module.css";

export default function Hero({ copy }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const heroRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);

  useSmoothParallax((loop) => {
    const hero = heroRef.current;
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
      loop.set(imageRef.current, { x: 0, lerp: 0.2 });
      loop.set(contentRef.current, { x: 0, lerp: 0.2 });
      return;
    }
    const scrolled = -rect.top;
    loop.set(imageRef.current, { x: scrolled * 0.45, lerp: 0.18 });
    loop.set(contentRef.current, { x: scrolled * -0.28, lerp: 0.16 });
  }, []);

  return (
    <section className={styles.hero} ref={heroRef}>
      <div className={styles.imageBackground}>
        <div
          className={styles.imageContainer}
          ref={imageRef}
        >
          <img
            src={copy?.heroImage?.value || "/BannerVilla4.jpg"}
            alt={
              copy?.heroImageAlt?.value ||
              "Caribbean style villa with jungle view"
            }
            className={styles.backgroundImage}
          />
        </div>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.container}>
          <div 
            className={styles.heroContent}
            ref={contentRef}
          >
            <h1 className={styles.title}>
              {(() => {
                const title = resolveCopy(copy?.heroTitle, t("hero.title"), language);
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
                fromCms={resolveCopy(copy?.heroSubtitle, t("hero.subtitle"), language).fromCms}
              >
                {resolveCopy(copy?.heroSubtitle, t("hero.subtitle"), language).value}
              </CmsText>
            </p>
            <div className={styles.cta}>
              <Link href="/villas" className={styles.btnPrimary}>
                <CmsText
                  fromCms={
                    resolveCopy(copy?.heroCtaPrimary, t("hero.exploreVillas"), language)
                      .fromCms
                  }
                >
                  {resolveCopy(copy?.heroCtaPrimary, t("hero.exploreVillas"), language).value}
                </CmsText>
              </Link>
              <Link href="/contact" className={styles.btnSecondary}>
                <CmsText
                  fromCms={
                    resolveCopy(copy?.heroCtaSecondary, t("hero.getInTouch"), language)
                      .fromCms
                  }
                >
                  {resolveCopy(copy?.heroCtaSecondary, t("hero.getInTouch"), language).value}
                </CmsText>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
