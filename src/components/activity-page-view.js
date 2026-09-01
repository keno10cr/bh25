"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import ActivityGallery from "@/components/activity-gallery";
import CmsText from "@/components/cms-text";
import PortableBody from "@/components/portable-text";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUiCopy } from "@/lib/cms-field";
import {
  activityGalleryImages,
  resolveWhatsIncluded,
} from "@/lib/activity-content";
import { displayMeta } from "@/lib/display-copy";
import { useTranslation } from "@/lib/translations";
import styles from "./activity-page.module.css";

const ActivitiesMap = dynamic(() => import("@/components/activities-map"), {
  ssr: false,
});

function translateLegendItems(items, t) {
  return (items || []).map((item) => {
    const slug =
      item.slug || String(item.title || "").toLowerCase().replace(/\s+/g, "-");
    const key = `activitiesPage.legend.${slug}`;
    const translated = t(key);
    return {
      ...item,
      slug,
      title: translated === key ? item.title : translated,
    };
  });
}

export default function ActivityPageView({ activity, legendItems = [] }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const preferUi = useUiCopy(language);
  const key = activity.translationKey;
  const translatedName = key ? t(`activitiesPage.${key}.name`) : activity.name;
  const translatedFull = key
    ? t(`activitiesPage.${key}.fullDescription`)
    : activity.fullDescription || activity.description;
  const useTranslatedName = Boolean(key) && (preferUi || !activity.nameFromCms);
  const useTranslatedBody =
    Boolean(key) && (preferUi || !activity.descriptionFromCms);
  const name = useTranslatedName ? translatedName : activity.name;
  const body = useTranslatedBody
    ? translatedFull
    : activity.fullDescription || activity.description;
  const duration = displayMeta(t, "activitiesPage.durations", activity.duration);
  const groupSize = displayMeta(
    t,
    "activitiesPage.groupSizes",
    activity.groupSize
  );
  const price = activity.priceKey
    ? t(`activitiesPage.prices.${activity.priceKey}`)
    : activity.price;
  const { items: whatsIncluded, fromCms: whatsIncludedFromCms } =
    resolveWhatsIncluded(activity, language);
  const galleryImages = activityGalleryImages(activity, name);
  const hasMap = Boolean(activity.coordinates?.lat && activity.coordinates?.lng);
  const mapLegend = translateLegendItems(
    activity.legendItems?.length > 0 ? activity.legendItems : legendItems,
    t
  );
  const tags = translateLegendItems(activity.legendItems, t);

  return (
    <article className={styles.page}>
      <Link href="/activities" className={styles.back}>
        ← {t("nav.activities")}
      </Link>
      <div className={styles.hero}>
        <img
          src={activity.image || "/placeholder.svg"}
          alt={activity.imageAlt || name}
        />
        {activity.number ? (
          <span className={styles.number}>{activity.number}</span>
        ) : null}
      </div>
      <header>
        <h1>
          <CmsText fromCms={!useTranslatedName && activity.nameFromCms}>
            {name}
          </CmsText>
        </h1>
        {tags?.length ? (
          <ul className={styles.tags}>
            {tags.map((item) => (
              <li key={item.slug || item.title}>
                <i style={{ backgroundColor: item.color || "#0a4c3a" }} />
                {item.title}
              </li>
            ))}
          </ul>
        ) : null}
      </header>
      {!useTranslatedBody && activity.descriptionBlocks ? (
        <PortableBody value={activity.descriptionBlocks} />
      ) : (
        <p className={styles.copy}>
          <CmsText fromCms={!useTranslatedBody && activity.descriptionFromCms}>
            {body}
          </CmsText>
        </p>
      )}
      {galleryImages.length > 0 ? (
        <ActivityGallery images={galleryImages} activityName={name} />
      ) : null}
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
      {whatsIncluded.length > 0 ? (
        <div className={styles.highlights}>
          <h2>{t("activitiesPage.labels.whatsIncluded")}</h2>
          <ul>
            {whatsIncluded.map((item, index) => (
              <li key={`${item}-${index}`}>
                <CmsText fromCms={whatsIncludedFromCms}>{item}</CmsText>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {hasMap ? (
        <div className={styles.mapWrap}>
          {activity.slug === "e-bike-rental" ? (
            <div className={styles.mapOverlay}>
              <img
                src="/activities/bikeShop.gif"
                alt="Puerto Viejo Bike Rentals shop"
                className={styles.mapOverlayGif}
              />
            </div>
          ) : null}
          <ActivitiesMap
            activities={[
              {
                ...activity,
                name,
                title: name,
                legendItems: tags,
              },
            ]}
            legendItems={mapLegend}
            selectedSlug={activity.slug}
            fitToPins={false}
            showLegend={false}
          />
        </div>
      ) : null}
      {key === "ketos" ? (
        <a
          href="https://www.stickoscr.com/designs/ketos/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.secondary}
        >
          {t("activitiesPage.labels.playKetos")}
        </a>
      ) : null}
      {key === "practiceWasteSorting" ? (
        <a
          href="https://www.toprrr.com/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.secondary}
        >
          {t("activitiesPage.labels.playTopRecycler")}
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
