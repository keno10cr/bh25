"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./gallery.module.css";

const galleryImages = [
  {
    id: 1,
    alt: "Aguacates",
    src: "/gallery/Aguacates.jpg",
  },
  {
    id: 2,
    alt: "Beach View",
    src: "/gallery/BeachView.jpg",
  },
  {
    id: 3,
    alt: "Blessed House Map",
    src: "/gallery/BHmap.jpg",
  },
  {
    id: 4,
    alt: "Blessed House Pool",
    src: "/gallery/BHPool.jpg",
  },
  {
    id: 5,
    alt: "Blessed House Views",
    src: "/gallery/BHViews.jpg",
  },
  {
    id: 6,
    alt: "Boat at Puerto Viejo",
    src: "/gallery/BoatAtPuertViejo.jpg",
  },
  {
    id: 7,
    alt: "Cocles River",
    src: "/gallery/CoclesRiver.jpg",
  },
  {
    id: 8,
    alt: "Mejenga at Punta Uva",
    src: "/gallery/mejengaAtPuntaUva.jpg",
  },
  {
    id: 9,
    alt: "Mirador View",
    src: "/gallery/miradorView.jpg",
  },
  {
    id: 10,
    alt: "Old Harbour",
    src: "/gallery/oldHarbour.jpg",
  },
  {
    id: 11,
    alt: "Playa Cocles",
    src: "/gallery/playaCocles.jpg",
  },
  {
    id: 12,
    alt: "Playa Grande",
    src: "/gallery/PlayaGrande.jpg",
  },
  {
    id: 13,
    alt: "Protect Bees",
    src: "/gallery/protectBees.jpg",
  },
  {
    id: 14,
    alt: "Puerto Viejo Spots",
    src: "/gallery/PuertoViejoSpots.jpg",
  },
  {
    id: 15,
    alt: "Social Area",
    src: "/gallery/SocialArea.jpg",
  },
  {
    id: 16,
    alt: "Sunrise AM",
    src: "/gallery/SunriseAM.jpg",
  },
  {
    id: 17,
    alt: "Sunrise Views",
    src: "/gallery/sunriseViews.jpg",
  },
  {
    id: 18,
    alt: "Sunset at Punta Uva",
    src: "/gallery/sunsetPuntaUva.jpg",
  },
  {
    id: 19,
    alt: "Tortuguero Canals",
    src: "/gallery/TortugueroCanals.jpg",
  },
  {
    id: 20,
    alt: "Villa 4",
    src: "/gallery/Villa4.jpg",
  },
];

export default function GalleryPage() {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const galleryRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        return galleryImages.length - 1;
      }
      return prevIndex - 1;
    });
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex === galleryImages.length - 1) {
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
            return galleryImages.length - 1;
          }
          return prevIndex - 1;
        });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentImageIndex((prevIndex) => {
          if (prevIndex === galleryImages.length - 1) {
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
  }, [isModalOpen]);

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
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Discover Paradise at Blessed House</h1>
        <p>
          Immerse yourself in peace and charm at Blessed House. Nestled amidst lush greenery, our Puerto Viejo haven offers relaxation, wildlife encounters, and easy access to the area's beauty. Explore, unwind, and experience the Caribbean's warm embrace.
        </p>
      </div>

      <div className={styles.gallery} ref={galleryRef}>
        {galleryImages.map((image, index) => (
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
      {isModalOpen && galleryImages.length > 0 && mounted && createPortal(
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
          <div className={styles.modal} ref={modalRef} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseButton} onClick={() => {
              setIsModalOpen(false);
              document.body.style.overflow = "unset";
            }} aria-label="Close">
              ×
            </button>
            <div className={styles.modalHeader}>
              <h2>{galleryImages[currentImageIndex]?.alt}</h2>
              <p className={styles.modalCounter}>
                {currentImageIndex + 1} / {galleryImages.length}
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
                  src={galleryImages[currentImageIndex]?.src || "/placeholder.svg"}
                  alt={galleryImages[currentImageIndex]?.alt}
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
            {galleryImages.length > 1 && (
              <div className={styles.modalThumbnails}>
                {galleryImages.map((image, index) => (
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
