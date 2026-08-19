"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./villa-gallery-modal.module.css";

export default function VillaGalleryModal({
  villa,
  images,
  captions = [],
  startIndex = 0,
  isOpen,
  onClose,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setCurrentIndex(startIndex || 0);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, startIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === 0) {
        return images.length - 1; // Infinite loop: go to last image
      }
      return prevIndex - 1;
    });
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === images.length - 1) {
        return 0; // Infinite loop: go to first image
      }
      return prevIndex + 1;
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images.length]);

  if (!isOpen || images.length === 0 || !mounted) return null;

  const modalContent = (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className={styles.header}>
          <h2>{villa.name}</h2>
          <p className={styles.counter}>
            {currentIndex + 1} / {images.length}
          </p>
        </div>
        <div className={styles.sliderContainer}>
          <button
            className={styles.navButton}
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            ‹
          </button>
          <div className={styles.slide}>
            <img
              src={images[currentIndex]}
              alt={captions[currentIndex] || `${villa.name} photo ${currentIndex + 1}`}
              className={styles.slideImage}
            />
            <p className={styles.caption}>
              {captions[currentIndex] || villa.name}
            </p>
          </div>
          <button
            className={styles.navButton}
            onClick={goToNext}
            aria-label="Next image"
          >
            ›
          </button>
        </div>
        {images.length > 1 && (
          <div className={styles.thumbnails}>
            {images.map((image, index) => (
              <button
                key={index}
                className={`${styles.thumbnail} ${
                  index === currentIndex ? styles.active : ""
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to image ${index + 1}`}
              >
                <img src={image} alt={`Thumbnail ${index + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
