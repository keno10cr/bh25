"use client";

import { useState } from "react";
import Image from "next/image";
import VillaCard from "@/components/villa-card";
import CmsText from "@/components/cms-text";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { resolveCopy, useUiCopy } from "@/lib/cms-field";
import { buildRoomRows } from "@/lib/house-arrangements";
import styles from "./villas.module.css";

const AMENITY_KEY_BY_NAME = {
  wifi: "wifi",
  "wi fi": "wifi",
  kitchen: "kitchen",
  parking: "parking",
  hotwater: "hotWater",
  "hot water": "hotWater",
  ac: "ac",
  "a/c": "ac",
  acmainbedroom: "acMainBedroom",
  "a/c in main bedroom": "acMainBedroom",
  actwobedrooms: "acTwoBedrooms",
  "a/c in 2 bedrooms": "acTwoBedrooms",
  aclargebedroom: "acLargeBedroom",
  "a/c in 1 large bedroom": "acLargeBedroom",
  acfullhouse: "acFullHouse",
  "a/c in every room": "acFullHouse",
  bbqarea: "bbqArea",
  "bbq area": "bbqArea",
  sharedpool: "sharedPool",
  "shared pool": "sharedPool",
};

const BED_TEXT = /\b(bed|beds|bunk|king|queen|single|cama|camas|litera)\b/i;

/**
 * Sanity stores amenities as typed English labels ("Hot water") while
 * translations are keyed ("hotWater"). Bed text typed into the list is set
 * aside because beds come from the villa's bedInfo key.
 */
function parseAmenities(values) {
  const keys = [];
  let bedText = "";
  for (const value of Array.isArray(values) ? values : []) {
    const raw = String(value || "").trim();
    if (!raw || raw.startsWith("bedInfo")) continue;
    const key = AMENITY_KEY_BY_NAME[raw.toLowerCase()];
    if (key) {
      if (!keys.includes(key)) keys.push(key);
    } else if (BED_TEXT.test(raw)) {
      bedText = bedText || raw;
    } else {
      keys.push(raw);
    }
  }
  return { keys, bedText };
}

/**
 * Bed text is one translated line per villa. Sentences become bullets as they
 * are ("Bedroom 1: 1 King Bed + 1 Single Bed"); otherwise each bed is a bullet.
 */
function splitBedText(text) {
  const value = String(text || "").trim();
  if (!value) return [];
  const sentences = value.split(/(?<=[.。])\s*/).map((part) => part.replace(/[.。]$/, "").trim());
  const parts = sentences.length > 1 ? sentences : value.split(/\s*[,+،、]\s*/);
  return parts.map((part) => part.replace(/^و(?=\S)/, "").trim()).filter(Boolean);
}

function villaNumber(villa) {
  const match = String(villa.slug || villa.name || "").match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

/** Hyphens and dashes become spaces so lengths stay aligned for slicing. */
function looseText(text) {
  return String(text || "").replace(/[-\u2010-\u2015]/g, " ").toLowerCase();
}

/**
 * English CMS descriptions include the villa's fun fact at the end; pull it out
 * so English shows it in the same highlighted box as the other languages.
 */
function splitFact(description, fact) {
  const text = String(description || "");
  const firstSentence = String(fact || "").split(/(?<=[.!?])\s/)[0];
  if (!firstSentence) return { description: text, fact: "" };
  const index = looseText(text).indexOf(looseText(firstSentence));
  if (index <= 0) return { description: text, fact: "" };
  return {
    description: text.slice(0, index).trim(),
    fact: text.slice(index).trim(),
  };
}

export default function VillasClient({ villas: cmsVillas = [], copy }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const preferUi = useUiCopy(language);
  const pageTitle = resolveCopy(copy?.title, t("villas.title"), language);
  const pageSubtitle = resolveCopy(copy?.subtitle, t("villas.subtitle"), language);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const sortedVillas = [...cmsVillas].sort((a, b) => villaNumber(a) - villaNumber(b));

  const villas = sortedVillas.map((villa) => {
    const { keys, bedText } = parseAmenities(villa.amenities);
    const amenities = keys.map((key) => {
      const lookup = `villas.amenities.${key}`;
      const translated = t(lookup);
      return { key, label: translated === lookup ? key : translated };
    });
    const roomRows = buildRoomRows(villa.houseArrangements, language);
    const bedList = roomRows.length
      ? roomRows
      : splitBedText(villa.bedInfo ? t(`villas.bedInfo.${villa.bedInfo}`) : bedText);

    const fact = villa.translationKey
      ? t(`villas.${villa.translationKey}.informativeFact`)
      : villa.informativeFact;
    const useTranslatedBody =
      Boolean(villa.translationKey) &&
      (preferUi || !villa.descriptionFromCms);
    const cmsParts = useTranslatedBody ? null : splitFact(villa.description, fact);

    return {
      ...villa,
      description: useTranslatedBody
        ? t(`villas.${villa.translationKey}.description`)
        : cmsParts.description,
      descriptionFromCms: useTranslatedBody ? false : villa.descriptionFromCms,
      informativeFact: fact || cmsParts?.fact || "",
      amenities,
      bedList,
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

      <div className={styles.grid}>
        {filteredVillas.map((villa) => (
          <div key={villa.id} className={styles.villaWrapper}>
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
