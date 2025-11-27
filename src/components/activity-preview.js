"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./activity-preview.module.css";

const activities = [
  {
    id: 1,
    translationKey: "snorkeling",
    icon: "🤿",
  },
  {
    id: 2,
    translationKey: "jungleHike",
    icon: "🥾",
  },
  {
    id: 3,
    translationKey: "boatTour",
    icon: "⛵",
  },
  {
    id: 4,
    translationKey: "bribriWonders",
    icon: "🍫",
  },
  {
    id: 5,
    translationKey: "wildlifeWatching",
    icon: "🦥",
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
              <div className={styles.icon}>{activity.icon}</div>
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
