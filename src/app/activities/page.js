"use client";

import { useState, useEffect, useRef } from "react";
import ActivityDetail from "@/components/activity-detail";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./activities.module.css";

// Base activities data - content will be translated dynamically
const activitiesBase = [
  {
    id: 1,
    translationKey: "familyReunions",
    duration: "Full day",
    priceKey: "contactUs",
    difficulty: "N/A",
    groupSize: "Up to 45 people",
    image: "/activities/all/familyReunion.jpg",
  },
  {
    id: 2,
    translationKey: "weddings",
    duration: "Full day",
    priceKey: "contactUs",
    difficulty: "N/A",
    groupSize: "Up to 50 guests",
    image: "/activities/all/weddings.jpg",
  },
  {
    id: 3,
    translationKey: "aerobics",
    duration: "45 minutes - 1 hour",
    priceKey: "contactUs",
    difficulty: "Moderate",
    groupSize: "Up to 15 people",
    image: "/activities/all/aerobics.jpg",
  },
  {
    id: 4,
    translationKey: "manzanillo",
    duration: "Half day",
    priceKey: "contactUs",
    difficulty: "Moderate",
    groupSize: "Up to 8 people",
    image: "/activities/all/manzanilloHike.jpg",
  },
  {
    id: 5,
    translationKey: "elMirador",
    duration: "1-2 hours",
    priceKey: "free",
    difficulty: "Moderate",
    groupSize: "Up to 6 people",
    image: "/activities/all/elMirador.jpg",
  },
  {
    id: 6,
    translationKey: "socialArea",
    duration: "All day",
    priceKey: "included",
    difficulty: "N/A",
    groupSize: "Up to 30 people",
    image: "/activities/all/socialArea.jpg",
  },
  {
    id: 7,
    translationKey: "pool",
    duration: "All day",
    priceKey: "included",
    difficulty: "Easy",
    groupSize: "10",
    image: "/activities/all/poolArea.jpg",
  },
  {
    id: 8,
    translationKey: "fishingTours",
    duration: "4-6 hours",
    priceKey: "contactUs",
    difficulty: "Moderate",
    groupSize: "Up to 6 people per boat",
    image: "/activities/all/fishingTours.jpg",
  },
  {
    id: 9,
    translationKey: "surfLessons",
    duration: "2-3 hours",
    priceKey: "contactUs",
    difficulty: "Challenging",
    groupSize: "Up to 4 people",
    image: "/activities/all/surfLessons.jpg",
  },
  {
    id: 10,
    translationKey: "bribriCacaoTour",
    duration: "3-4 hours",
    priceKey: "contactUs",
    difficulty: "Easy",
    groupSize: "Up to 12 people",
    image: "/activities/all/cacaoTours.jpg",
  },
  {
    id: 11,
    translationKey: "kayaking",
    duration: "2-4 hours",
    priceKey: "contactUs",
    difficulty: "Moderate",
    groupSize: "Up to 6 people",
    image: "/activities/all/kayaking.jpg",
  },
  {
    id: 12,
    translationKey: "volioWaterfalls",
    duration: "Half day",
    priceKey: "contactUs",
    difficulty: "Moderate",
    groupSize: "Up to 8 people",
    image: "/activities/all/valioWaterfall.jpg",
  },
  {
    id: 13,
    translationKey: "puntaUva",
    duration: "2-3 hours",
    priceKey: "free",
    difficulty: "Easy",
    groupSize: "Unlimited",
    image: "/activities/all/puntaUva.jpg",
  },
  {
    id: 14,
    translationKey: "ketos",
    duration: "1-2 hours",
    priceKey: "contactUs",
    difficulty: "Moderate",
    groupSize: "2-4 people",
    image: "/activities/all/sakiKetos.jpg",
  },
  {
    id: 15,
    translationKey: "practiceWasteSorting",
    duration: "10 - 30 minutes",
    priceKey: "free",
    difficulty: "Easy",
    groupSize: "Any",
    image: "/activities/all/toprrractivity.jpg",
  },
  {
    id: 16,
    translationKey: "cahuitaNationalPark",
    duration: "Half day",
    priceKey: "contactUs",
    difficulty: "Moderate",
    groupSize: "Up to 8 people",
    image: "/activities/all/cahuitaNP.jpg",
  },
  {
    id: 17,
    translationKey: "eBikeRental",
    duration: "Half day - Full day",
    priceKey: "contactUs",
    difficulty: "Easy",
    groupSize: "Unlimited",
    externalLink: "https://puertoviejobikerentals.com/",
    image: "/activities/all/puertoviejobikerental.jpg",
  },
];

export default function ActivitiesPage() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const activitiesRef = useRef(null);

  // Create activities with translated content
  const activities = activitiesBase.map((activity) => ({
    ...activity,
    name: t(`activitiesPage.${activity.translationKey}.name`),
    description: t(`activitiesPage.${activity.translationKey}.description`),
    fullDescription: t(`activitiesPage.${activity.translationKey}.fullDescription`),
    highlights: t(`activitiesPage.${activity.translationKey}.highlights`),
    price: t(`activitiesPage.prices.${activity.priceKey}`),
    duration: activity.duration ? t(`activitiesPage.durations.${activity.duration}`) || activity.duration : activity.duration,
    groupSize: activity.groupSize ? t(`activitiesPage.groupSizes.${activity.groupSize}`) || activity.groupSize : activity.groupSize,
  }));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, entry.target.dataset.id]));
          } else {
            // Remove from visibleItems when it leaves viewport to allow re-animation
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

    const items = activitiesRef.current?.querySelectorAll("[data-activity-item]");
    items?.forEach((item) => observer.observe(item));

    return () => {
      items?.forEach((item) => observer.unobserve(item));
    };
  }, [selectedDifficulty]);

  const filteredActivities = activities.filter((activity) => {
    if (selectedDifficulty === "All") return true;
    if (!activity.difficulty || activity.difficulty === "N/A") return false;
    return activity.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
  });

  const difficultyOptions = [
    t("activitiesPage.filters.all"),
    t("activitiesPage.filters.easy"),
    t("activitiesPage.filters.moderate"),
    t("activitiesPage.filters.challenging"),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{t("activitiesPage.title")}</h1>
        <p>{t("activitiesPage.subtitle")}</p>
      </div>

      <div className={styles.filters}>
        {difficultyOptions.map((difficulty) => {
          const difficultyKey = difficulty === t("activitiesPage.filters.all") ? "All" :
            difficulty === t("activitiesPage.filters.easy") ? "Easy" :
            difficulty === t("activitiesPage.filters.moderate") ? "Moderate" :
            difficulty === t("activitiesPage.filters.challenging") ? "Challenging" : "All";
          return (
            <button
              key={difficulty}
              className={`${styles.filterBtn} ${
                selectedDifficulty === difficultyKey ? styles.active : ""
              }`}
              onClick={() => setSelectedDifficulty(difficultyKey)}
            >
              {difficulty}
            </button>
          );
        })}
      </div>

      <div className={styles.grid} ref={activitiesRef}>
        {filteredActivities.map((activity, index) => (
          <div
            key={activity.id}
            data-activity-item
            data-id={activity.id}
            className={`${styles.activityWrapper} ${
              visibleItems.has(String(activity.id)) ? styles.visible : ""
            }`}
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <ActivityDetail activity={activity} />
          </div>
        ))}
      </div>
    </div>
  );
}
