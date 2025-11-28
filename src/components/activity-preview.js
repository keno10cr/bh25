"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./activity-preview.module.css";

const activities = [
  {
    id: 1,
    translationKey: "snorkeling",
    image: "/info/snorkeling.png",
  },
  {
    id: 2,
    translationKey: "jungleHike",
    image: "/info/hike.png",
  },
  {
    id: 3,
    translationKey: "boatTour",
    image: "/info/boat.png",
  },
  {
    id: 4,
    translationKey: "bribriWonders",
    image: "/info/bribri.png",
  },
  {
    id: 5,
    translationKey: "wildlifeWatching",
    image: "/info/wildLife.png",
  },
];

export default function ActivityPreview() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, entry.target.dataset.id]));
          } else {
            setVisibleItems((prev) => {
              const next = new Set(prev);
              next.delete(entry.target.dataset.id);
              return next;
            });
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    const items = sectionRef.current?.querySelectorAll("[data-activity-item]");
    items?.forEach((item) => observer.observe(item));

    return () => {
      items?.forEach((item) => observer.unobserve(item));
    };
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>{t("activities.title")}</h2>
          <p>{t("activities.subtitle")}</p>
        </div>

        <div className={styles.grid}>
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              data-activity-item
              data-id={activity.id}
              className={`${styles.activityCard} ${
                visibleItems.has(String(activity.id)) ? styles.visible : ""
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className={styles.icon}>
                <Image 
                  src={activity.image} 
                  alt={t(`activities.${activity.translationKey}.name`)} 
                  width={120}
                  height={120}
                />
              </div>
              <h3>{t(`activities.${activity.translationKey}.name`)}</h3>
              <p>{t(`activities.${activity.translationKey}.description`)}</p>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <Link href="/activities" className={styles.btn}>
            {t("activities.exploreAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
