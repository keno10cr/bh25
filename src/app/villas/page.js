"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import VillaCard from "@/components/villa-card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./villas.module.css";

// Helper function to generate gallery images for each villa
const getGalleryImages = (villaNumber) => {
  const folder = `/villas/${villaNumber}/`;
  
  const maxImages = {
    3: 5,
    4: 6,
    5: 5,
    6: 4,
    7: 7,
    8: 7,
    9: 5,
    10: 7,
    11: 8,
    12: 8,
  };
  
  const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const images = [];
  const count = maxImages[villaNumber] || 8;
  
  // Add villa-specific images
  for (let i = 0; i < count; i++) {
    images.push(folder + `${villaNumber}${letters[i]}.jpg`);
  }
  
  // Add the 4 general images at the end
  images.push(
    "/villas/general/charger.jpg",
    "/villas/general/junglepool.jpg",
    "/villas/general/map.jpg",
    "/villas/general/pool.jpg"
  );
  
  return images;
};

// Base villa data - descriptions and facts will be translated dynamically
const villasBase = [
  {
    id: 3,
    name: "Villa #3 Baula Turtle",
    translationKey: "villa3",
    bedrooms: 4,
    bathrooms: 2,
    maxPeople: 10,
    amenities: ["wifi", "kitchen", "parking", "hotWater"],
    bedInfo: null, // Will be added to translations
    image: "/villas/3/3a.jpg",
    getGalleryImages: () => getGalleryImages(3),
  },
  {
    id: 4,
    name: "Villa #4 Colibrí",
    translationKey: "villa4",
    bedrooms: 1,
    bathrooms: 1,
    maxPeople: 3,
    amenities: ["wifi", "kitchen", "parking", "hotWater"],
    bedInfo: "bedInfo1", // 1 Queen Bed, 1 Individual Bed
    image: "/villas/4/4a.jpg",
    getGalleryImages: () => getGalleryImages(4),
  },
  {
    id: 5,
    name: "Villa #5 Jaguar",
    translationKey: "villa5",
    bedrooms: 3,
    bathrooms: 1,
    maxPeople: 2,
    amenities: ["ac", "wifi", "kitchen", "parking", "hotWater"],
    bedInfo: "bedInfo2", // 1 double bed
    image: "/villas/5/5c.jpg",
    getGalleryImages: () => getGalleryImages(5),
  },
  {
    id: 6,
    name: "Villa #6 Rana Roja",
    translationKey: "villa6",
    bedrooms: 1,
    bathrooms: 1,
    maxPeople: 2,
    amenities: ["wifi", "kitchen", "parking", "hotWater"],
    bedInfo: "bedInfo2", // 1 double bed
    image: "/villas/6/6f.jpg",
    getGalleryImages: () => getGalleryImages(6),
  },
  {
    id: 7,
    name: "Villa #7 Rana Verde",
    translationKey: "villa7",
    bedrooms: 2,
    bathrooms: 2,
    maxPeople: 6,
    amenities: ["ac", "wifi", "bbqArea", "kitchen", "parking", "hotWater"],
    bedInfo: null,
    image: "/villas/7/7d.jpg",
    getGalleryImages: () => getGalleryImages(7),
  },
  {
    id: 8,
    name: "Villa #8 Oso peresozo",
    translationKey: "villa8",
    bedrooms: 1,
    bathrooms: 1,
    maxPeople: 5,
    amenities: ["ac", "wifi", "bbqArea", "kitchen", "parking", "hotWater"],
    bedInfo: "bedInfo3", // 1 king + 3 singles beds
    image: "/villas/8/8a.jpg",
    getGalleryImages: () => getGalleryImages(8),
  },
  {
    id: 9,
    name: "Villa #9 Mono Cariblanco",
    translationKey: "villa9",
    bedrooms: 1,
    bathrooms: 1,
    maxPeople: 3,
    amenities: ["wifi", "kitchen", "parking", "hotWater"],
    bedInfo: "bedInfo4", // 1 queen + 1 single
    image: "/villas/9/9a.jpg",
    getGalleryImages: () => getGalleryImages(9),
  },
  {
    id: 10,
    name: "Villa #10 Mono Ardilla",
    translationKey: "villa10",
    bedrooms: 1,
    bathrooms: 1,
    maxPeople: 4,
    amenities: ["wifi", "bbqArea", "kitchen", "parking", "hotWater"],
    bedInfo: "bedInfo5", // 1 queen + 1 bunk bed
    image: "/villas/10/10d.jpg",
    getGalleryImages: () => getGalleryImages(10),
  },
  {
    id: 11,
    name: "Villa #11 Lapa Roja",
    translationKey: "villa11",
    bedrooms: 2,
    bathrooms: 1,
    maxPeople: 6,
    amenities: ["ac", "wifi", "bbqArea", "kitchen", "parking", "hotWater"],
    bedInfo: "bedInfo6", // 1 queen + 1 double bed + 1 bunk bed
    image: "/villas/11/11g.jpg",
    getGalleryImages: () => getGalleryImages(11),
  },
  {
    id: 12,
    name: "Villa #12 Mariposa Morpho",
    translationKey: "villa12",
    bedrooms: 2,
    bathrooms: 2,
    maxPeople: 8,
    amenities: ["ac", "wifi", "bbqArea", "kitchen", "parking", "hotWater"],
    bedInfo: null,
    image: "/villas/12/12i.jpg",
    getGalleryImages: () => getGalleryImages(12),
  },
];

export default function VillasPage() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [visibleItems, setVisibleItems] = useState(new Set());
  const villasRef = useRef(null);

  // Create villas with translated content
  const villas = villasBase.map((villa) => {
    const baseAmenities = villa.amenities.filter(a => !a.startsWith("bedInfo"));
    const translatedAmenities = baseAmenities.map((amenity) => t(`villas.amenities.${amenity}`));
    if (villa.bedInfo) {
      translatedAmenities.push(t(`villas.bedInfo.${villa.bedInfo}`));
    }
    return {
      ...villa,
      description: t(`villas.${villa.translationKey}.description`),
      informativeFact: t(`villas.${villa.translationKey}.informativeFact`),
      amenities: translatedAmenities,
      galleryImages: villa.getGalleryImages(),
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

    const items = villasRef.current?.querySelectorAll("[data-villa-item]");
    items?.forEach((item) => observer.observe(item));

    return () => {
      items?.forEach((item) => observer.unobserve(item));
    };
  }, [filteredVillas]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{t("villas.title")}</h1>
        <p>{t("villas.subtitle")}</p>
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
        <p>{t("footer.parkingFee")} <span className={styles.asterisk}>*</span></p>
      </div>
    </div>
  );
}


