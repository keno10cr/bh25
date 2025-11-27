"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./gallery.module.css";

const galleryImages = [
  {
    id: 1,
    translationKey: "aguacates",
    src: "/gallery/Aguacates.jpg",
  },
  {
    id: 2,
    translationKey: "beachView",
    src: "/gallery/BeachView.jpg",
  },
  {
    id: 3,
    translationKey: "blessedHouseMap",
    src: "/gallery/BHmap.jpg",
  },
  {
    id: 4,
    translationKey: "blessedHousePool",
    src: "/gallery/BHPool.jpg",
  },
  {
    id: 5,
    translationKey: "blessedHouseViews",
    src: "/gallery/BHViews.jpg",
  },
  {
    id: 6,
    translationKey: "boatAtPuertoViejo",
    src: "/gallery/BoatAtPuertViejo.jpg",
  },
  {
    id: 7,
    translationKey: "coclesRiver",
    src: "/gallery/CoclesRiver.jpg",
  },
  {
    id: 8,
    translationKey: "mejengaAtPuntaUva",
    src: "/gallery/mejengaAtPuntaUva.jpg",
  },
  {
    id: 9,
    translationKey: "miradorView",
    src: "/gallery/miradorView.jpg",
  },
  {
    id: 10,
    translationKey: "oldHarbour",
    src: "/gallery/oldHarbour.jpg",
  },
  {
    id: 11,
    translationKey: "playaCocles",
    src: "/gallery/playaCocles.jpg",
  },
  {
    id: 12,
    translationKey: "playaGrande",
    src: "/gallery/PlayaGrande.jpg",
  },
  {
    id: 13,
    translationKey: "protectBees",
    src: "/gallery/protectBees.jpg",
  },
  {
    id: 14,
    translationKey: "puertoViejoSpots",
    src: "/gallery/PuertoViejoSpots.jpg",
  },
  {
    id: 15,
    translationKey: "socialArea",
    src: "/gallery/SocialArea.jpg",
  },
  {
    id: 16,
    translationKey: "sunriseAM",
    src: "/gallery/SunriseAM.jpg",
  },
  {
    id: 17,
    translationKey: "sunriseViews",
    src: "/gallery/sunriseViews.jpg",
  },
  {
    id: 18,
    translationKey: "sunsetAtPuntaUva",
    src: "/gallery/sunsetPuntaUva.jpg",
  },
  {
    id: 19,
    translationKey: "tortugueroCanals",
    src: "/gallery/TortugueroCanals.jpg",
  },
  {
    id: 20,
    translationKey: "villa4",
    src: "/gallery/Villa4.jpg",
  },
];

export default function GalleryPage() {
  const { language } = useLanguage();
  const t = useTranslation(language);
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
        <h1>{t("gallery.title")}</h1>
        <p>
          {t("gallery.description")}
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
            <img src={image.src || "/placeholder.svg"} alt={t(`gallery.images.${image.translationKey}`)} loading="lazy" />
            <div className={styles.overlay}>
              <p>{t(`gallery.images.${image.translationKey}`)}</p>
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
            }} aria-label={t("gallery.close")}>
              ×
            </button>
            <div className={styles.modalHeader}>
              <h2>{galleryImages[currentImageIndex] ? t(`gallery.images.${galleryImages[currentImageIndex].translationKey}`) : ""}</h2>
              <p className={styles.modalCounter}>
                {currentImageIndex + 1} / {galleryImages.length}
              </p>
            </div>
            <div className={styles.modalSliderContainer}>
              <button
                className={styles.modalNavButton}
                onClick={goToPrevious}
                aria-label={t("gallery.previousImage")}
              >
                ‹
              </button>
              <div className={styles.modalSlide}>
                <img
                  src={galleryImages[currentImageIndex]?.src || "/placeholder.svg"}
                  alt={galleryImages[currentImageIndex] ? t(`gallery.images.${galleryImages[currentImageIndex].translationKey}`) : ""}
                  className={styles.modalSlideImage}
                />
              </div>
              <button
                className={styles.modalNavButton}
                onClick={goToNext}
                aria-label={t("gallery.nextImage")}
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
                    aria-label={`${t("gallery.goToImage")} ${index + 1}`}
                  >
                    <img src={image.src} alt={t(`gallery.images.${image.translationKey}`)} />
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
