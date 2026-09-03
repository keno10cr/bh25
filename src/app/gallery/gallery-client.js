"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import CmsText from "@/components/cms-text";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { resolveCopy } from "@/lib/cms-field";
import styles from "./gallery.module.css";

function galleryLabel(image, t) {
  if (image?.fromCms && (image.caption || image.alt)) {
    return image.caption || image.alt;
  }
  if (image?.translationKey) {
    return t(`gallery.images.${image.translationKey}`);
  }
  return image?.caption || image?.alt || "";
}

export default function GalleryClient({ copy }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const galleryImages = copy?.images || [];
  const title = resolveCopy(copy?.title, t("gallery.title"), language);
  const description = resolveCopy(
    copy?.description,
    t("gallery.description"),
    language
  );
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
      closeModal();
    }
  };

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
  }, [isModalOpen, galleryImages.length]);

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
  }, [galleryImages.length]);

  const currentImage = galleryImages[currentImageIndex];
  const currentLabel = galleryLabel(currentImage, t);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          <CmsText fromCms={title.fromCms}>{title.value}</CmsText>
        </h1>
        <p>
          <CmsText fromCms={description.fromCms}>{description.value}</CmsText>
        </p>
      </div>

      <div className={styles.gallery} ref={galleryRef}>
        {galleryImages.map((image, index) => {
          const label = galleryLabel(image, t);
          return (
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
              <img
                src={image.src || "/placeholder.svg"}
                alt={image.alt || label}
                loading="lazy"
              />
              <div className={styles.overlay}>
                <p>{label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && galleryImages.length > 0 && mounted && createPortal(
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
          <div className={styles.modal} ref={modalRef} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalCloseButton}
              onClick={closeModal}
              aria-label={t("gallery.close")}
            >
              ×
            </button>
            <div className={styles.modalHeader}>
              <h2>{currentLabel}</h2>
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
                  src={currentImage?.src || "/placeholder.svg"}
                  alt={currentImage?.alt || currentLabel}
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
                {galleryImages.map((image, index) => {
                  const label = galleryLabel(image, t);
                  return (
                    <button
                      key={image.id}
                      className={`${styles.modalThumbnail} ${
                        index === currentImageIndex ? styles.modalThumbnailActive : ""
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`${t("gallery.goToImage")} ${index + 1}`}
                    >
                      <img src={image.src} alt={image.alt || label} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
