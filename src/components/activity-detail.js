"use client";

import Link from "next/link";
import CmsText from "@/components/cms-text";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./activity-detail.module.css";

export default function ActivityDetail({ activity }) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={activity.image || "/placeholder.svg"} alt={activity.name} />
        {activity.number ? (
          <span className={styles.numberBadge}>{activity.number}</span>
        ) : null}
        {activity.difficulty && activity.difficulty !== "N/A" && (
          <span
            className={styles.difficulty}
            data-level={activity.difficulty.toLowerCase()}
          >
            {t(`activitiesPage.difficulty.${activity.difficulty.toLowerCase()}`)}
          </span>
        )}
      </div>

      <div className={styles.content}>
        <h3>
          <CmsText fromCms={activity.nameFromCms}>{activity.name}</CmsText>
        </h3>
        <p className={styles.description}>
          <CmsText fromCms={activity.descriptionFromCms}>
            {activity.description}
          </CmsText>
        </p>

        {activity.duration || activity.price || activity.groupSize ? (
          <div className={styles.info}>
            {activity.duration && (
              <div className={styles.infoItem}>
                <span className={styles.label}>{t("activitiesPage.labels.duration")}</span>
                <span className={styles.value}>{activity.duration}</span>
              </div>
            )}
            {activity.groupSize && (
              <div className={styles.infoItem}>
                <span className={styles.label}>{t("activitiesPage.labels.groupSize")}</span>
                <span className={styles.value}>{activity.groupSize}</span>
              </div>
            )}
            {activity.price && (
              <div className={styles.infoItem}>
                <span className={styles.label}>{t("activitiesPage.labels.price")}</span>
                <span className={styles.value}>{activity.price}</span>
              </div>
            )}
          </div>
        ) : null}

        {activity.slug ? (
          <Link
            href={`/activities/${activity.slug}`}
            className={styles.learnMoreBtn}
          >
            {t("activitiesPage.labels.viewActivity")}
          </Link>
        ) : (
          <Link
            href="/contact?subject=activities"
            className={styles.contactLink}
          >
            {t("activitiesPage.labels.contactUs")}
          </Link>
        )}
      </div>
    </div>
  );
}
