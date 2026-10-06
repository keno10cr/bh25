"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./activity-gallery.module.css";

export default function ActivityGallery({ images = [], activityName = "Activity" }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [activeIndex, setActiveIndex] = useState(null);
  const [mounted, setMounted] = useState(false);
  const triggerRefs = useRef([]);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const lastTriggerRef = useRef(null);

  const isOpen = activeIndex !== null;
  const count = images.length;
  const altFor = (image, index) =>
    image?.alt || `${activityName} photo ${index + 1}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  const open = (index) => {
    lastTriggerRef.current = triggerRefs.current[index] || null;
    setActiveIndex(index);
  };

  const close = useCallback(() => {
    setActiveIndex(null);
    lastTriggerRef.current?.focus();
  }, []);

  const step = useCallback(
    (delta) => {
      setActiveIndex((current) =>
        current === null ? current : (current + delta + count) % count
      );
    },
    [count]
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "ArrowRight" && count > 1) {
        step(1);
      } else if (event.key === "ArrowLeft" && count > 1) {
        step(-1);
      } else if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll("button");
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close, step, count]);

  if (!count) return null;

  const activeImage = isOpen ? images[activeIndex] : null;

  return (
    <section
      className={styles.gallery}
      aria-label={`${activityName} photo gallery`}
    >
      <div className={styles.grid}>
        {images.map((image, index) => (
          <button
            key={image.url || index}
            type="button"
            ref={(el) => {
              triggerRefs.current[index] = el;
            }}
            className={styles.item}
            onClick={() => open(index)}
            aria-haspopup="dialog"
          >
            <img
              src={image.url}
              alt={altFor(image, index)}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </button>
        ))}
      </div>

      {mounted && activeImage
        ? createPortal(
            <div
              className={styles.backdrop}
              onClick={(event) => {
                if (event.target === event.currentTarget) close();
              }}
            >
              <div
                ref={dialogRef}
                className={styles.dialog}
                role="dialog"
                aria-modal="true"
                aria-label={`${activityName} photo gallery`}
              >
                <button
                  ref={closeRef}
                  type="button"
                  className={styles.close}
                  onClick={close}
                  aria-label={t("gallery.close")}
                >
                  ×
                </button>

                <img
                  src={activeImage.url}
                  alt={altFor(activeImage, activeIndex)}
                  className={styles.modalImage}
                />

                {count > 1 ? (
                  <>
                    <button
                      type="button"
                      className={`${styles.nav} ${styles.navPrev}`}
                      onClick={() => step(-1)}
                      aria-label={t("gallery.previousImage")}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className={`${styles.nav} ${styles.navNext}`}
                      onClick={() => step(1)}
                      aria-label={t("gallery.nextImage")}
                    >
                      ›
                    </button>
                    <p className={styles.count} aria-live="polite">
                      {activeIndex + 1} / {count}
                    </p>
                  </>
                ) : null}
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
