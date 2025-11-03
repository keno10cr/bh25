"use client";

import { useState, useEffect, useRef } from "react";
import VillaCard from "@/components/villa-card";
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
  
  for (let i = 0; i < count; i++) {
    images.push(folder + `${villaNumber}${letters[i]}.png`);
  }
  
  return images;
};

const villas = [
  {
    id: 3,
    name: "Villa #3 Baula Turtle",
    description: "Caribbean Style! Blessed House is a Caribbean local family property. Come forget about reality and relax with your family and friends!",
    bedrooms: 2,
    bathrooms: 1,
    maxPeople: 3,
    amenities: ["AC", "Wifi", "Kitchen", "Parking", "Hot water"],
    image: "/villas/3/3a.png",
    galleryImages: getGalleryImages(3),
  },
  {
    id: 4,
    name: "Villa #4 Colibri",
    description: "Caribbean Style! Blessed House is a Caribbean local family property. Come forget about reality and relax with your family and friends!",
    bedrooms: 2,
    bathrooms: 1,
    maxPeople: 4,
    amenities: ["AC", "Wifi", "Kitchen", "Parking", "Hot water"],
    image: "/villas/4/4a.png",
    galleryImages: getGalleryImages(4),
  },
  {
    id: 5,
    name: "Villa #5 Jaguar",
    description: "Caribbean Style! Blessed House is a Caribbean local family property. Come forget about reality and relax with your family and friends!",
    bedrooms: 1,
    bathrooms: 1,
    maxPeople: 2,
    amenities: ["AC", "Wifi", "Kitchen", "Parking", "Hot water"],
    image: "/villas/5/5a.png",
    galleryImages: getGalleryImages(5),
  },
  {
    id: 6,
    name: "Villa #6 Rana Roja",
    description: "Caribbean Style! Blessed House is a Caribbean local family property. Come forget about reality and relax with your family and friends!",
    bedrooms: 2,
    bathrooms: 1,
    maxPeople: 2,
    amenities: ["AC", "Wifi", "Kitchen", "Parking", "Hot water"],
    image: "/villas/6/6a.png",
    galleryImages: getGalleryImages(6),
  },
  {
    id: 7,
    name: "Villa #7 Rana Verde",
    description: "Caribbean Style! Blessed House is a Caribbean local family property. Come forget about reality and relax with your family and friends!",
    bedrooms: 3,
    bathrooms: 2,
    maxPeople: 6,
    amenities: ["AC", "Wifi", "BBQ Area", "Kitchen", "Parking", "Hot water"],
    image: "/villas/7/7a.png",
    galleryImages: getGalleryImages(7),
  },
  {
    id: 8,
    name: "Villa #8 Oso Perezoso",
    description: "Caribbean Style! Blessed House is a Caribbean local family property. Come forget about reality and relax with your family and friends!",
    bedrooms: 3,
    bathrooms: 2,
    maxPeople: 6,
    amenities: ["AC", "Wifi", "BBQ Area", "Kitchen", "Parking", "Hot water"],
    image: "/villas/8/8a.png",
    galleryImages: getGalleryImages(8),
  },
  {
    id: 9,
    name: "Villa #9 Mono Cariblanco",
    description: "Caribbean Style! Blessed House is a Caribbean local family property. Come forget about reality and relax with your family and friends!",
    bedrooms: 2,
    bathrooms: 1,
    maxPeople: 4,
    amenities: ["AC", "Wifi", "Kitchen", "Parking", "Hot water"],
    image: "/villas/9/9a.png",
    galleryImages: getGalleryImages(9),
  },
  {
    id: 10,
    name: "Villa #10 Mono Ardilla",
    description: "Caribbean Style! Blessed House is a Caribbean local family property. Come forget about reality and relax with your family and friends!",
    bedrooms: 3,
    bathrooms: 2,
    maxPeople: 4,
    amenities: ["AC", "Wifi", "BBQ Area", "Kitchen", "Parking", "Hot water"],
    image: "/villas/10/10a.png",
    galleryImages: getGalleryImages(10),
  },
  {
    id: 11,
    name: "Villa #11 Lapa Roja",
    description: "Caribbean Style! Blessed House is a Caribbean local family property. Come forget about reality and relax with your family and friends!",
    bedrooms: 4,
    bathrooms: 2,
    maxPeople: 8,
    amenities: ["AC", "Wifi", "BBQ Area", "Kitchen", "Parking", "Hot water"],
    image: "/villas/11/11a.png",
    galleryImages: getGalleryImages(11),
  },
  {
    id: 12,
    name: "Villa #12 Mariposa Morpho",
    description: "Caribbean Style! Blessed House is a Caribbean local family property. Come forget about reality and relax with your family and friends!",
    bedrooms: 4,
    bathrooms: 3,
    maxPeople: 8,
    amenities: ["AC", "Wifi", "BBQ Area", "Kitchen", "Parking", "Hot water"],
    image: "/villas/12/12a.png",
    galleryImages: getGalleryImages(12),
  },
];

export default function VillasPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [visibleItems, setVisibleItems] = useState(new Set());
  const villasRef = useRef(null);

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "2", label: "2 People" },
    { value: "4", label: "4 People" },
    { value: "6+", label: "6+ People" },
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
        <h1>Our Villas</h1>
        <p>Choose from our collection of Caribbean style accommodations in Puerto Viejo</p>
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
    </div>
  );
}
