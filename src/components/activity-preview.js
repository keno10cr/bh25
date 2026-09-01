"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import CmsText from "@/components/cms-text";
import { resolveCopy } from "@/lib/cms-field";
import { HOME_THINGS_TO_DO } from "@/data/page-defaults";
import styles from "./activity-preview.module.css";

export default function ActivityPreview({ copy }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const title = resolveCopy(copy?.activitiesTitle, t("activities.title"), language);
  const subtitle = resolveCopy(
    copy?.activitiesSubtitle,
    t("activities.subtitle"),
    language
  );
  const cta = resolveCopy(copy?.activitiesCta, t("activities.exploreAll"), language);
  const activities = (copy?.thingsToDoItems?.length
    ? copy.thingsToDoItems
    : HOME_THINGS_TO_DO.map((item) => ({
        ...item,
        fromCms: false,
        titleFromCms: false,
        descriptionFromCms: false,
      }))
  ).map((item) => {
    const key = item.id;
    const nameKey = `activities.${key}.name`;
    const descKey = `activities.${key}.description`;
    const translatedName = t(nameKey);
    const translatedDesc = t(descKey);
    const hasName = translatedName !== nameKey;
    const hasDesc = translatedDesc !== descKey;
    const preferUi = language !== "en";
    return {
      ...item,
      title:
        preferUi && hasName
          ? translatedName
          : item.titleFromCms
            ? item.title
            : hasName
              ? translatedName
              : item.title,
      description:
        preferUi && hasDesc
          ? translatedDesc
          : item.descriptionFromCms
            ? item.description
            : hasDesc
              ? translatedDesc
              : item.description,
      titleFromCms: preferUi && hasName ? false : item.titleFromCms,
      descriptionFromCms: preferUi && hasDesc ? false : item.descriptionFromCms,
    };
  });
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
  }, [activities]);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>
            <CmsText fromCms={title.fromCms}>{title.value}</CmsText>
          </h2>
          <p>
            <CmsText fromCms={subtitle.fromCms}>{subtitle.value}</CmsText>
          </p>
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
                  alt={activity.imageAlt || activity.title}
                  width={120}
                  height={120}
                />
              </div>
              <h3>
                <CmsText fromCms={activity.titleFromCms}>
                  {activity.title}
                </CmsText>
              </h3>
              <p>
                <CmsText fromCms={activity.descriptionFromCms}>
                  {activity.description}
                </CmsText>
              </p>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <Link href="/activities" className={styles.btn}>
            <CmsText fromCms={cta.fromCms}>{cta.value}</CmsText>
          </Link>
        </div>
      </div>
    </section>
  );
}
