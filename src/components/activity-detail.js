"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./activity-detail.module.css";

export default function ActivityDetail({ activity }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLearnMore = () => {
    setIsExpanded(true);
    
    // Track activity click
    fetch("/api/track-activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        activityName: activity.name,
        activityId: activity.id,
        language: language,
        timestamp: new Date().toISOString(),
      }),
    }).catch((err) => console.error("Failed to track activity click:", err));
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={activity.image || "/placeholder.svg"} alt={activity.name} />
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
        <h3>{activity.name}</h3>
        <p className={styles.description}>{activity.description}</p>

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

        {isExpanded && (
          <>
            {activity.fullDescription && (
              <div className={styles.fullDesc}>
                <p>{activity.fullDescription}</p>
              </div>
            )}

            {activity.highlights && activity.highlights.length > 0 && (
              <div className={styles.highlights}>
                <h4>{t("activitiesPage.labels.whatsIncluded")}</h4>
                <ul>
                  {activity.highlights.map((item, idx) => (
                    <li key={idx}>
                      <span className={styles.checkmark}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activity.externalLink ? (
              <a
                href={activity.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                {t("activitiesPage.labels.visitWebsite")}
              </a>
            ) : (
              <Link
                href="/contact?subject=activities"
                className={styles.contactLink}
              >
                {t("activitiesPage.labels.contactUs")}
              </Link>
            )}

            <button className={styles.showLessBtn} onClick={() => setIsExpanded(false)}>
              {t("activitiesPage.labels.showLess")}
            </button>
          </>
        )}

        {!isExpanded && (
          <button className={styles.learnMoreBtn} onClick={handleLearnMore}>
            {t("activitiesPage.labels.readMore")}
          </button>
        )}
      </div>
    </div>
  );
}
