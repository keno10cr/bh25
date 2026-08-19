"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import CmsText from "@/components/cms-text";
import PortableBody from "@/components/portable-text";
import { useLanguage } from "@/contexts/LanguageContext";
import { displayMeta } from "@/lib/display-copy";
import { useTranslation } from "@/lib/translations";
import styles from "./activity-page.module.css";

const ActivitiesMap = dynamic(() => import("@/components/activities-map"), {
  ssr: false,
});

export default function ActivityPageView({ activity, legendItems = [] }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const duration = displayMeta(t, "activitiesPage.durations", activity.duration);
  const groupSize = displayMeta(
    t,
    "activitiesPage.groupSizes",
    activity.groupSize
  );
  const price = activity.priceKey
    ? t(`activitiesPage.prices.${activity.priceKey}`)
    : activity.price;
  const highlights = activity.translationKey
    ? t(`activitiesPage.${activity.translationKey}.highlights`)
    : activity.highlights;
  const hasMap = Boolean(activity.coordinates?.lat && activity.coordinates?.lng);
  const mapLegend =
    activity.legendItems?.length > 0 ? activity.legendItems : legendItems;

  return (
    <article className={styles.page}>
      <Link href="/activities" className={styles.back}>
        ← {t("nav.activities")}
      </Link>
      <div className={styles.hero}>
        <img src={activity.image || "/placeholder.svg"} alt={activity.name} />
        {activity.number ? (
          <span className={styles.number}>{activity.number}</span>
        ) : null}
      </div>
      <header>
        <h1>
          <CmsText fromCms={activity.nameFromCms}>{activity.name}</CmsText>
        </h1>
        {activity.legendItems?.length ? (
          <ul className={styles.tags}>
            {activity.legendItems.map((item) => (
              <li key={item.slug || item.title}>
                <i style={{ backgroundColor: item.color || "#0a4c3a" }} />
                {item.title}
              </li>
            ))}
          </ul>
        ) : null}
      </header>
      {activity.descriptionBlocks ? (
        <PortableBody value={activity.descriptionBlocks} />
      ) : (
        <p className={styles.copy}>
          <CmsText fromCms={activity.descriptionFromCms}>
            {activity.fullDescription || activity.description}
          </CmsText>
        </p>
      )}
      <div className={styles.info}>
        {duration ? (
          <div>
            <span>{t("activitiesPage.labels.duration")}</span>
            <strong>{duration}</strong>
          </div>
        ) : null}
        {groupSize ? (
          <div>
            <span>{t("activitiesPage.labels.groupSize")}</span>
            <strong>{groupSize}</strong>
          </div>
        ) : null}
        {price ? (
          <div>
            <span>{t("activitiesPage.labels.price")}</span>
            <strong>{price}</strong>
          </div>
        ) : null}
      </div>
      {Array.isArray(highlights) && highlights.length > 0 ? (
        <div className={styles.highlights}>
          <h2>{t("activitiesPage.labels.whatsIncluded")}</h2>
          <ul>
            {highlights.map((item, index) => {
              const text = typeof item === "object" ? item.text : item;
              return <li key={index}>{text}</li>;
            })}
          </ul>
        </div>
      ) : null}
      {hasMap ? (
        <div className={styles.mapWrap}>
          <ActivitiesMap
            activities={[activity]}
            legendItems={mapLegend}
            selectedSlug={activity.slug}
            fitToPins={false}
            showLegend={false}
          />
        </div>
      ) : null}
      {activity.translationKey === "ketos" ? (
        <a
          href="https://www.stickoscr.com/designs/ketos/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.secondary}
        >
          Play Ketos Online
        </a>
      ) : null}
      {activity.translationKey === "practiceWasteSorting" ? (
        <a
          href="https://www.toprrr.com/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.secondary}
        >
          Play Top Recycler Online
        </a>
      ) : null}
      {activity.externalLink ? (
        <a
          href={activity.externalLink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.book}
        >
          {t("activitiesPage.labels.visitWebsite")}
        </a>
      ) : (
        <Link href="/contact?subject=activities" className={styles.book}>
          {t("activitiesPage.labels.contactUs")}
        </Link>
      )}
    </article>
  );
}
