"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { AIRBNB_PROFILE_URL, trackAirbnbRedirectClicked } from "@/lib/posthog";
import { useSmoothParallax } from "@/lib/parallax-motion";
import styles from "./footer.module.css";

export default function Footer() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const currentYear = new Date().getFullYear();
  const footerRef = useRef(null);
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);

  useSmoothParallax((loop) => {
    const footer = footerRef.current;
    if (!footer) return;
    const rect = footer.getBoundingClientRect();
    const viewH = window.innerHeight || 1;
    const start = viewH;
    const end = viewH * 0.15;
    const progress = Math.min(
      1,
      Math.max(0, (start - rect.top) / Math.max(1, start - end))
    );

    loop.set(layer2Ref.current, {
      // Back layer: 10px above the floor when settled.
      y: (1 - progress) * 100,
      lerp: 0.07,
    });
    loop.set(layer1Ref.current, {
      // Front layer: flush with the floor when settled.
      y: (1 - progress) * 80,
      lerp: 0.16,
    });
  }, []);

  return (
    <footer className={styles.footer} ref={footerRef}>
      <div className={styles.layers} aria-hidden="true">
        <div
          ref={layer2Ref}
          className={`${styles.layer} ${styles.layerBack}`}
        />
        <div
          ref={layer1Ref}
          className={`${styles.layer} ${styles.layerFront}`}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.logoSection}>
          <Image
            src="/blessedhouse_logo25.png"
            alt="Blessed House Logo"
            width={150}
            height={150}
            className={styles.logo}
          />
          <p className={styles.location}>{t("footer.location")}</p>
        </div>

        <div className={styles.container}>
          <div className={styles.section}>
            <h3>Blessed House</h3>
            <p>{t("footer.tagline")}</p>
          </div>

          <div className={styles.section}>
            <h4>{t("footer.quickLinks")}</h4>
            <ul>
              <li>
                <Link href="/gallery">{t("nav.gallery")}</Link>
              </li>
              <li>
                <Link href="/villas">{t("nav.villas")}</Link>
              </li>
              <li>
                <Link href="/activities">{t("nav.activities")}</Link>
              </li>
              <li>
                <Link href="/blog">{t("nav.blog")}</Link>
              </li>
              <li>
                <Link href="/contact">{t("nav.contact")}</Link>
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h4>{t("footer.contactInfo")}</h4>
            <p>
              {t("common.email")}:{" "}
              <a href="mailto:blessedhousecr@gmail.com">blessedhousecr@gmail.com</a>
            </p>
            <p>
              {t("common.phone")}:{" "}
              <a href="tel:+17546104710">+1 (754) 610-4710</a>
            </p>
            <p>Puerto Viejo, Limón, Costa Rica</p>
          </div>

          <div className={styles.section}>
            <h4>{t("footer.socialMedia")}</h4>
            <div className={styles.socialRow}>
              <a
                href="https://www.instagram.com/blessedhouse"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={styles.socialIcon}
              >
                <Image
                  src="/social/instagram.png"
                  alt="Instagram"
                  width={50}
                  height={50}
                />
              </a>
              <a
                href={AIRBNB_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Airbnb"
                className={styles.socialIcon}
                onClick={() =>
                  trackAirbnbRedirectClicked({
                    villa_id: null,
                    villa_name: null,
                    destination_url: AIRBNB_PROFILE_URL,
                  })
                }
              >
                <Image
                  src="/social/airbnb.png"
                  alt="Airbnb"
                  width={50}
                  height={50}
                />
              </a>
              <a
                href="https://www.youtube.com/@blessedhouse3354"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className={styles.socialIcon}
              >
                <Image
                  src="/social/youtube.png"
                  alt="YouTube"
                  width={50}
                  height={50}
                />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.copyright}>
          <p>&copy; {currentYear} Blessed House Villas. {t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
