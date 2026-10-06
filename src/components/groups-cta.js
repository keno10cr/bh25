"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { resolveCopy } from "@/lib/cms-field";
import { PVG_PAGE_DEFAULTS } from "@/data/pvg-defaults";
import styles from "./groups-cta.module.css";

export default function GroupsCta({ copy = null, spaced = false }) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const text = (key) =>
    resolveCopy(copy?.[key], t(`pvg.${key}`) || PVG_PAGE_DEFAULTS[key], language)
      .value;

  const title = text("promoTitle");
  const image = copy?.promoImage?.value || PVG_PAGE_DEFAULTS.promoImage;
  const imageAlt = copy?.promoImageAlt?.value || title;

  return (
    <section
      className={`${styles.section} ${spaced ? styles.spaced : ""}`}
      aria-labelledby="groups-cta-title"
    >
      <div className={styles.card}>
        <div className={styles.media}>
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            className={styles.image}
          />
        </div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{text("promoEyebrow")}</p>
          <h2 id="groups-cta-title" className={styles.title}>
            {title}
          </h2>
          <p className={styles.body}>{text("promoBody")}</p>
          <Link href="/pvg" className={styles.button}>
            {text("promoCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
