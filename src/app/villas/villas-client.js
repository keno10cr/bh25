"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import VillaCard from "@/components/villa-card";
import CmsText from "@/components/cms-text";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { resolveCopy } from "@/lib/cms-field";
import styles from "./villas.module.css";

export default function VillasClient({ villas: cmsVillas = [], copy }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const pageTitle = resolveCopy(copy?.title, t("villas.title"));
  const pageSubtitle = resolveCopy(copy?.subtitle, t("villas.subtitle"));
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [visibleItems, setVisibleItems] = useState(new Set());
  const villasRef = useRef(null);

  const villas = cmsVillas.map((villa) => {
    const amenityKeys = Array.isArray(villa.amenities) ? villa.amenities : [];
    const translatedAmenities = amenityKeys
      .filter((amenity) => !String(amenity).startsWith("bedInfo"))
      .map((amenity) => {
        const translated = t(`villas.amenities.${amenity}`);
        return translated === `villas.amenities.${amenity}` ? amenity : translated;
      });
    if (villa.bedInfo) {
      translatedAmenities.push(t(`villas.bedInfo.${villa.bedInfo}`));
    }
    return {
      ...villa,
      description: villa.descriptionFromCms
        ? villa.description
        : villa.translationKey
          ? t(`villas.${villa.translationKey}.description`)
          : villa.description,
      informativeFact: villa.translationKey
        ? t(`villas.${villa.translationKey}.informativeFact`)
        : villa.informativeFact,
      amenities: villa.fromCms ? amenityKeys : translatedAmenities,
      galleryImages: villa.galleryImages,
    };
  });

  const filterOptions = [
    { value: "all", label: t("villas.filters.all") },
    { value: "2", label: t("villas.filters.twoPeople") },
    { value: "4", label: t("villas.filters.fourPeople") },
    { value: "6+", label: t("villas.filters.sixPlusPeople") },
  ];

  const getFilterValue = (maxPeople) => {
    if (maxPeople <= 2) return "2";
    if (maxPeople <= 4) return "4";
    return "6+";
  };

  const filteredVillas =
    selectedFilter === "all"
      ? villas
      : villas.filter((villa) => {
          const filterValue = getFilterValue(villa.maxPeople);
          if (selectedFilter === "6+") {
            return filterValue === "6+";
          }
          return filterValue === selectedFilter;
        });

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

    const items = villasRef.current?.querySelectorAll("[data-villa-item]");
    items?.forEach((item) => observer.observe(item));

    return () => {
      items?.forEach((item) => observer.unobserve(item));
    };
  }, [filteredVillas]);

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

      <div className={styles.filterContainer}>
        <div className={styles.filters}>
          {filterOptions.map((option) => (
            <button
              key={option.value}
              className={`${styles.filterBtn} ${
                selectedFilter === option.value ? styles.active : ""
              }`}
              onClick={() => setSelectedFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid} ref={villasRef}>
        {filteredVillas.map((villa, index) => (
          <div
            key={villa.id}
            data-villa-item
            data-id={villa.id}
            className={`${styles.villaWrapper} ${
              visibleItems.has(String(villa.id)) ? styles.visible : ""
            }`}
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <VillaCard villa={villa} />
          </div>
        ))}
      </div>

      <div className={styles.chargingNote}>
        <Image
          src="/info/ChargingStation.jpg"
          alt="Charging Station"
          width={40}
          height={40}
          className={styles.chargingIcon}
        />
        <p>
          {t("footer.parkingFee")} <span className={styles.asterisk}>*</span>
        </p>
      </div>
    </div>
  );
}
