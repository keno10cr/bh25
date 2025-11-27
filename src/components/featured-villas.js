"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./featured-villas.module.css";

const villas = [
  {
    id: 4,
    name: "Villa #4 Colibri",
    translationKey: "villa4",
    image: "/villas/4/4a.jpg",
  },
  {
    id: 9,
    name: "Villa #9 Mono Cariblanco",
    translationKey: "villa9",
    image: "/villas/9/9a.jpg",
  },
  {
    id: 12,
    name: "Villa #12 Mariposa Morpho",
    translationKey: "villa12",
    image: "/villas/12/12a.jpg",
  },
];

export default function FeaturedVillas() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>{t("featuredVillas.title")}</h2>
          <p>{t("featuredVillas.subtitle")}</p>
        </div>

        <div className={styles.grid}>
          {villas.map((villa) => (
            <div key={villa.id} className={styles.card}>
              <div className={styles.image}>
                <img src={villa.image || "/placeholder.svg"} alt={villa.name} />
              </div>
              <div className={styles.content}>
                <h3>{villa.name}</h3>
                <p>{t(`featuredVillas.${villa.translationKey}.description`)}</p>
                <div className={styles.footer}>
                  <Link href={`/villas#villa-${villa.id}`} className={styles.link}>
                    {t("common.learnMore")} →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.viewAll}>
          <Link href="/villas" className={styles.btnLink}>
            {t("featuredVillas.viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
