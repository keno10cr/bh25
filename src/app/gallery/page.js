"use client";

import { useState } from "react";
import styles from "./gallery.module.css";

const galleryImages = [
  {
    id: 1,
    alt: "Beachfront bungalow with ocean view",
    category: "villas",
    src: "/luxury-beachfront-villa-tropical.jpg",
  },
  {
    id: 2,
    alt: "Jungle surrounded bungalow",
    category: "villas",
    src: "/jungle-bungalow-surrounded-by-trees.jpg",
  },
  {
    id: 3,
    alt: "Sunset view from villa",
    category: "views",
    src: "/tropical-bungalow-sunset-view.jpg",
  },
  {
    id: 4,
    alt: "Pool and garden area",
    category: "amenities",
    src: "/luxury-beachfront-villa-tropical.jpg",
  },
  {
    id: 5,
    alt: "Beach with palm trees",
    category: "views",
    src: "/tropical-beach-bungalow-resort.jpg",
  },
  {
    id: 6,
    alt: "Indoor villa living space",
    category: "villas",
    src: "/luxury-beachfront-villa-tropical.jpg",
  },
  {
    id: 7,
    alt: "Outdoor dining area",
    category: "amenities",
    src: "/jungle-bungalow-surrounded-by-trees.jpg",
  },
  {
    id: 8,
    alt: "Tropical garden pathway",
    category: "amenities",
    src: "/tropical-bungalow-sunset-view.jpg",
  },
  {
    id: 9,
    alt: "Beach at sunrise",
    category: "views",
    src: "/tropical-beach-bungalow-resort.jpg",
  },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredImages =
    selectedCategory === "all"
      ? galleryImages
      : galleryImages.filter((img) => img.category === selectedCategory);

  const categories = [
    { value: "all", label: "All" },
    { value: "villas", label: "Villas" },
    { value: "views", label: "Views" },
    { value: "amenities", label: "Amenities" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Photo Gallery</h1>
        <p>Discover the beauty of Blessed House Resort</p>
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.filters}>
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`${styles.filterBtn} ${
                selectedCategory === cat.value ? styles.active : ""
              }`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.gallery}>
        {filteredImages.map((image) => (
          <div key={image.id} className={styles.galleryItem}>
            <img src={image.src || "/placeholder.svg"} alt={image.alt} loading="lazy" />
            <div className={styles.overlay}>
              <p>{image.alt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

