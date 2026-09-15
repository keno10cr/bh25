"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { resolveCopy } from "@/lib/cms-field";
import { AIRBNB_PROFILE_URL, trackAirbnbRedirectClicked } from "@/lib/posthog";
import { useSmoothParallax } from "@/lib/parallax-motion";
import { FOOTER_SETTINGS_DEFAULTS } from "@/data/page-defaults";
import styles from "./footer.module.css";

const SOCIAL_ICONS = {
  instagram: "/social/instagram.png",
  airbnb: "/social/airbnb.png",
  youtube: "/social/youtube.png",
};

const NAV_KEY_BY_HREF = {
  "/gallery": "gallery",
  "/villas": "villas",
  "/activities": "activities",
  "/blog": "blog",
  "/contact": "contact",
};

function linkLabel(link, t, language) {
  const key = NAV_KEY_BY_HREF[link.href];
  if (key && language !== "en") return t(`nav.${key}`);
  return link.label || (key ? t(`nav.${key}`) : link.href);
}

export default function Footer({ footer }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const currentYear = new Date().getFullYear();
  const footerRef = useRef(null);
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);

  const brandName = footer?.brandName?.value || FOOTER_SETTINGS_DEFAULTS.brandName;
  const locationLine = resolveCopy(
    footer?.locationLine,
    t("footer.location"),
    language
  );
  const tagline = resolveCopy(footer?.tagline, t("footer.tagline"), language);
  const email = footer?.email?.value || FOOTER_SETTINGS_DEFAULTS.email;
  const addressLine =
    footer?.addressLine?.value || FOOTER_SETTINGS_DEFAULTS.addressLine;
  const copyright = resolveCopy(
    footer?.copyright,
    t("footer.copyright"),
    language
  );
  const phones =
    Array.isArray(footer?.phones) && footer.phones.length > 0
      ? footer.phones
      : FOOTER_SETTINGS_DEFAULTS.phones;
  const quickLinks =
    Array.isArray(footer?.quickLinks) && footer.quickLinks.length > 0
      ? footer.quickLinks
      : FOOTER_SETTINGS_DEFAULTS.quickLinks;
  const socialLinks =
    Array.isArray(footer?.socialLinks) && footer.socialLinks.length > 0
      ? footer.socialLinks
      : FOOTER_SETTINGS_DEFAULTS.socialLinks;

  useSmoothParallax((loop) => {
    const el = footerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewH = window.innerHeight || 1;
    const start = viewH;
    const end = viewH * 0.15;
    const progress = Math.min(
      1,
      Math.max(0, (start - rect.top) / Math.max(1, start - end))
    );

    loop.set(layer2Ref.current, {
      y: (1 - progress) * 100,
      lerp: 0.07,
    });
    loop.set(layer1Ref.current, {
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
            alt={`${brandName} Logo`}
            width={150}
            height={150}
            className={styles.logo}
          />
          <p className={styles.location}>{locationLine.value}</p>
        </div>

        <div className={styles.container}>
          <div className={styles.section}>
            <h3>{brandName}</h3>
            <p>{tagline.value}</p>
          </div>

          <div className={styles.section}>
            <h4>{t("footer.quickLinks")}</h4>
            <ul>
              {quickLinks.map((link) => (
                <li key={link.key || link.href}>
                  <Link href={link.href}>
                    {linkLabel(link, t, language)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.section}>
            <h4>{t("footer.contactInfo")}</h4>
            <p>
              {t("common.email")}:{" "}
              <a href={`mailto:${email}`}>{email}</a>
            </p>
            <p>
              {t("common.phone")}:{" "}
              {phones.map((phone, index) => (
                <Fragment key={`${phone.tel}-${index}`}>
                  {index > 0 && (
                    <>
                      <br />
                      {t("common.or")}
                      <br />
                    </>
                  )}
                  <a href={`tel:${phone.tel}`}>{phone.label}</a>
                </Fragment>
              ))}
            </p>
            <p>{addressLine}</p>
          </div>

          <div className={styles.section}>
            <h4>{t("footer.socialMedia")}</h4>
            <div className={styles.socialRow}>
              {socialLinks.map((link) => {
                const icon = link.iconUrl || SOCIAL_ICONS[link.network];
                if (!icon) return null;
                const isAirbnb = link.network === "airbnb";
                return (
                  <a
                    key={link.key || link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className={styles.socialIcon}
                    onClick={
                      isAirbnb
                        ? () =>
                            trackAirbnbRedirectClicked({
                              villa_id: null,
                              villa_name: null,
                              destination_url: link.url || AIRBNB_PROFILE_URL,
                            })
                        : undefined
                    }
                  >
                    <Image
                      src={icon}
                      alt={link.iconAlt || link.label}
                      width={50}
                      height={50}
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.copyright}>
          <p>
            &copy; {currentYear} {brandName} Villas. {copyright.value}
          </p>
        </div>
      </div>
    </footer>
  );
}
