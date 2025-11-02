"use client"

import { useState } from "react"
import styles from "./gallery.module.css"

const galleryImages = [
  { id: 1, alt: "Beachfront bungalow with ocean view", category: "villas", src: "/placeholder.svg?key=bngal" },
  { id: 2, alt: "Jungle surrounded bungalow", category: "villas", src: "/placeholder.svg?key=jngal" },
  { id: 3, alt: "Sunset view from villa", category: "views", src: "/placeholder.svg?key=sngal" },
  { id: 4, alt: "Pool and garden area", category: "amenities", src: "/placeholder.svg?key=pngal" },
  { id: 5, alt: "Beach with palm trees", category: "views", src: "/placeholder.svg?key=bngal2" },
  { id: 6, alt: "Indoor villa living space", category: "villas", src: "/placeholder.svg?key=ingal" },
  { id: 7, alt: "Outdoor dining area", category: "amenities", src: "/placeholder.svg?key=dngal" },
  { id: 8, alt: "Tropical garden pathway", category: "amenities", src: "/placeholder.svg?key=tngal" },
  { id: 9, alt: "Beach at sunrise", category: "views", src: "/placeholder.svg?key=bngal3" },
]

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredImages =
    selectedCategory === "all" ? galleryImages : galleryImages.filter((img) => img.category === selectedCategory)

  const categories = [
    { value: "all", label: "All" },
    { value: "villas", label: "Villas" },
    { value: "views", label: "Views" },
    { value: "amenities", label: "Amenities" },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Photo Gallery</h1>
        <p>Discover the beauty of Tropical Paradise Resort</p>
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.filters}>
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`${styles.filterBtn} ${selectedCategory === cat.value ? styles.active : ""}`}
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
  )
}
