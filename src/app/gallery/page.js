"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./gallery.module.css";

const galleryImages = [
  {
    id: 1,
    alt: "Bungalow near the beach with ocean view",
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
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const galleryRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const openModal = (imageIndex) => {
    setCurrentImageIndex(imageIndex);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "unset";
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex === 0) {
        return filteredImages.length - 1;
      }
      return prevIndex - 1;
    });
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex === filteredImages.length - 1) {
        return 0;
      }
      return prevIndex + 1;
    });
  };

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setIsModalOpen(false);
      document.body.style.overflow = "unset";
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentImageIndex((prevIndex) => {
          if (prevIndex === 0) {
            return filteredImages.length - 1;
          }
          return prevIndex - 1;
        });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentImageIndex((prevIndex) => {
          if (prevIndex === filteredImages.length - 1) {
            return 0;
          }
          return prevIndex + 1;
        });
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsModalOpen(false);
        document.body.style.overflow = "unset";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, filteredImages.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, entry.target.dataset.id]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    const items = galleryRef.current?.querySelectorAll("[data-gallery-item]");
    items?.forEach((item) => observer.observe(item));

    return () => {
      items?.forEach((item) => observer.unobserve(item));
    };
  }, [filteredImages]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Discover Paradise at Blessed House</h1>
        <p>
          Immerse yourself in peace and charm at Blessed House. Nestled amidst lush greenery, our Puerto Viejo haven offers relaxation, wildlife encounters, and easy access to the area's beauty. Explore, unwind, and experience the Caribbean's warm embrace.
        </p>
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

      <div className={styles.gallery} ref={galleryRef}>
        {filteredImages.map((image, index) => (
          <div
            key={image.id}
            data-gallery-item
            data-id={image.id}
            className={`${styles.galleryItem} ${
              visibleItems.has(String(image.id)) ? styles.visible : ""
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => openModal(index)}
          >
            <img src={image.src || "/placeholder.svg"} alt={image.alt} loading="lazy" />
            <div className={styles.overlay}>
              <p>{image.alt}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gallery Modal */}
      {isModalOpen && filteredImages.length > 0 && mounted && createPortal(
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
          <div className={styles.modal} ref={modalRef} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseButton} onClick={() => {
              setIsModalOpen(false);
              document.body.style.overflow = "unset";
            }} aria-label="Close">
              ×
            </button>
            <div className={styles.modalHeader}>
              <h2>{filteredImages[currentImageIndex]?.alt}</h2>
              <p className={styles.modalCounter}>
                {currentImageIndex + 1} / {filteredImages.length}
              </p>
            </div>
            <div className={styles.modalSliderContainer}>
              <button
                className={styles.modalNavButton}
                onClick={goToPrevious}
                aria-label="Previous image"
              >
                ‹
              </button>
              <div className={styles.modalSlide}>
                <img
                  src={filteredImages[currentImageIndex]?.src || "/placeholder.svg"}
                  alt={filteredImages[currentImageIndex]?.alt}
                  className={styles.modalSlideImage}
                />
              </div>
              <button
                className={styles.modalNavButton}
                onClick={goToNext}
                aria-label="Next image"
              >
                ›
              </button>
            </div>
            {filteredImages.length > 1 && (
              <div className={styles.modalThumbnails}>
                {filteredImages.map((image, index) => (
                  <button
                    key={image.id}
                    className={`${styles.modalThumbnail} ${
                      index === currentImageIndex ? styles.modalThumbnailActive : ""
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                    aria-label={`Go to image ${index + 1}`}
                  >
                    <img src={image.src} alt={image.alt} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
