"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./groups-cta.module.css";

export default function GroupsCta({ spaced = false }) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  return (
    <section
      className={`${styles.section} ${spaced ? styles.spaced : ""}`}
      aria-labelledby="groups-cta-title"
    >
      <div className={styles.card}>
        <div className={styles.media}>
          <Image
            src="/activities/all/groupBreakfast.jpg"
            alt={t("pvg.promoTitle")}
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            className={styles.image}
          />
        </div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t("pvg.promoEyebrow")}</p>
          <h2 id="groups-cta-title" className={styles.title}>
            {t("pvg.promoTitle")}
          </h2>
          <p className={styles.body}>{t("pvg.promoBody")}</p>
          <Link href="/pvg" className={styles.button}>
            {t("pvg.promoCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
