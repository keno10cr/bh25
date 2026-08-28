"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ActivityDetail from "@/components/activity-detail";
import CmsText from "@/components/cms-text";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { resolveCopy, useUiCopy } from "@/lib/cms-field";
import { displayMeta } from "@/lib/display-copy";
import { resolveWhatsIncluded } from "@/lib/activity-content";
import styles from "./activities.module.css";

const ActivitiesMap = dynamic(() => import("@/components/activities-map"), {
  ssr: false,
});

function translateLegendItems(items, t) {
  return (items || []).map((item) => {
    const slug = item.slug || String(item.title || "").toLowerCase().replace(/\s+/g, "-");
    const key = `activitiesPage.legend.${slug}`;
    const translated = t(key);
    return {
      ...item,
      slug,
      title: translated === key ? item.title : translated,
    };
  });
}

export default function ActivitiesClient({
  activities: cmsActivities = [],
  mapActivities = [],
  legendItems = [],
  copy,
}) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const preferUi = useUiCopy(language);
  const pageTitle = resolveCopy(copy?.title, t("activitiesPage.title"), language);
  const pageSubtitle = resolveCopy(
    copy?.subtitle,
    t("activitiesPage.subtitle"),
    language
  );
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedSlug, setSelectedSlug] = useState("");
  const activitiesRef = useRef(null);
  const pendingScrollSlug = useRef("");

  const activities = useMemo(
    () =>
      cmsActivities.map((activity) => {
        const key = activity.translationKey;
        const translatedName = key
          ? t(`activitiesPage.${key}.name`)
          : activity.name;
        const translatedDescription = key
          ? t(`activitiesPage.${key}.description`)
          : activity.description;
        const translatedFull = key
          ? t(`activitiesPage.${key}.fullDescription`)
          : activity.fullDescription;
        const useTranslatedName = Boolean(key) && (preferUi || !activity.nameFromCms);
        const useTranslatedBody =
          Boolean(key) && (preferUi || !activity.descriptionFromCms);
        return {
          ...activity,
          name: useTranslatedName ? translatedName : activity.name,
          title: useTranslatedName
            ? translatedName
            : activity.title || activity.name,
          description: useTranslatedBody
            ? translatedDescription
            : activity.description,
          fullDescription: useTranslatedBody
            ? translatedFull
            : activity.fullDescription || activity.description,
          nameFromCms: useTranslatedName ? false : activity.nameFromCms,
          descriptionFromCms: useTranslatedBody
            ? false
            : activity.descriptionFromCms,
          legendItems: translateLegendItems(activity.legendItems, t),
          whatsIncluded: resolveWhatsIncluded(activity, language).items,
          price: activity.priceKey
            ? t(`activitiesPage.prices.${activity.priceKey}`)
            : activity.price,
          duration: displayMeta(
            t,
            "activitiesPage.durations",
            activity.duration
          ),
          groupSize: displayMeta(
            t,
            "activitiesPage.groupSizes",
            activity.groupSize
          ),
        };
      }),
    [cmsActivities, t, preferUi]
  );

  const translatedLegend = useMemo(
    () => translateLegendItems(legendItems, t),
    [legendItems, t]
  );

  const pins = useMemo(() => {
    const source = mapActivities.length ? mapActivities : activities;
    const bySlug = new Map(activities.map((activity) => [activity.slug, activity]));
    return source
      .map((pin) => bySlug.get(pin.slug) || pin)
      .filter((activity) => activity.coordinates?.lat && activity.coordinates?.lng);
  }, [mapActivities, activities]);

  const selected = activities.find((activity) => activity.slug === selectedSlug) || null;
  const selectedPinIndex = pins.findIndex((activity) => activity.slug === selectedSlug);

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

  const handleSelectPin = useCallback((activity) => {
    if (!activity?.slug) return;
    setSelectedSlug(activity.slug);
  }, []);

  const handleStep = useCallback(
    (direction) => {
      if (!pins.length) return;
      const current = selectedPinIndex >= 0 ? selectedPinIndex : 0;
      const nextIndex = (current + direction + pins.length) % pins.length;
      setSelectedSlug(pins[nextIndex].slug);
    },
    [pins, selectedPinIndex]
  );

  const handleViewActivity = useCallback(() => {
    if (!selected?.slug) return;
    const slug = selected.slug;
    pendingScrollSlug.current = slug;
    if (selectedDifficulty !== "All") {
      setSelectedDifficulty("All");
      return;
    }
    const node = document.getElementById(`activity-${slug}`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
    pendingScrollSlug.current = "";
  }, [selected, selectedDifficulty]);

  useEffect(() => {
    if (!pins.length) return;
    if (!selectedSlug || !pins.some((activity) => activity.slug === selectedSlug)) {
      setSelectedSlug(pins[0].slug);
    }
  }, [pins, selectedSlug]);

  useEffect(() => {
    const slug = pendingScrollSlug.current;
    if (!slug) return;
    pendingScrollSlug.current = "";
    const node = document.getElementById(`activity-${slug}`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedDifficulty, filteredActivities]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          <CmsText fromCms={pageTitle.fromCms}>{pageTitle.value}</CmsText>
        </h1>
        <p>
          <CmsText fromCms={pageSubtitle.fromCms}>{pageSubtitle.value}</CmsText>
        </p>
      </div>

      <div className={styles.mapLayout}>
        <ActivitiesMap
          activities={pins}
          legendItems={translatedLegend}
          selectedSlug={selectedSlug}
          onSelect={handleSelectPin}
        />
        <aside className={styles.toolbox} aria-live="polite">
          {selected ? (
            <>
              <div className={styles.toolboxNav}>
                <button
                  type="button"
                  className={styles.toolboxNavBtn}
                  onClick={() => handleStep(-1)}
                >
                  {t("activitiesPage.labels.previous")}
                </button>
                <span className={styles.toolboxNavNumber}>
                  {selected.number || selectedPinIndex + 1}
                </span>
                <button
                  type="button"
                  className={styles.toolboxNavBtn}
                  onClick={() => handleStep(1)}
                >
                  {t("activitiesPage.labels.next")}
                </button>
              </div>
              <div className={styles.toolboxImage}>
                <img
                  src={selected.image || "/placeholder.svg"}
                  alt={selected.name}
                />
              </div>
              <h2>
                <CmsText fromCms={selected.nameFromCms}>{selected.name}</CmsText>
              </h2>
              <button
                type="button"
                className={styles.toolboxLink}
                onClick={handleViewActivity}
              >
                {t("activitiesPage.labels.viewActivity")}
              </button>
            </>
          ) : (
            <p className={styles.toolboxEmpty}>
              {t("activitiesPage.labels.selectPin")}
            </p>
          )}
        </aside>
      </div>

      <div className={styles.filters}>
        {difficultyOptions.map((difficulty) => {
          const difficultyKey =
            difficulty === t("activitiesPage.filters.all")
              ? "All"
              : difficulty === t("activitiesPage.filters.easy")
                ? "Easy"
                : difficulty === t("activitiesPage.filters.moderate")
                  ? "Moderate"
                  : difficulty === t("activitiesPage.filters.challenging")
                    ? "Challenging"
                    : "All";
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
            id={`activity-${activity.slug}`}
            data-activity-item
            data-id={activity.id}
            className={`${styles.activityWrapper} ${
              visibleItems.has(String(activity.id)) ? styles.visible : ""
            } ${selectedSlug === activity.slug ? styles.highlighted : ""}`}
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <ActivityDetail activity={activity} />
          </div>
        ))}
      </div>
    </div>
  );
}
