"use client";

import { useState } from "react";
import VillaGalleryModal from "./villa-gallery-modal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./villa-card.module.css";

export default function VillaCard({ villa }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={styles.card} id={`villa-${villa.id}`}>
        <div className={styles.imageContainer}>
          <img src={villa.image || "/placeholder.svg"} alt={villa.name} />
        </div>

        <div className={styles.content}>
          <h3>{villa.name}</h3>
          <p className={styles.description}>{villa.description}</p>

          {villa.informativeFact && (
            <p className={styles.informativeFact}>{villa.informativeFact}</p>
          )}

          <div className={styles.details}>
            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>{t("villas.details.bedrooms")}</span>
                <span className={styles.detailValue}>{villa.bedrooms}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>{t("villas.details.bathrooms")}</span>
                <span className={styles.detailValue}>{villa.bathrooms}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>{t("villas.details.maxPeople")}</span>
                <span className={styles.detailValue}>{villa.maxPeople}</span>
              </div>
            </div>

            {villa.amenities && villa.amenities.length > 0 && (
              <div className={styles.amenities}>
                <span className={styles.amenitiesLabel}>{t("villas.details.amenities")}</span>
                <div className={styles.amenitiesList}>
                  {villa.amenities.map((amenity, index) => (
                    <span key={index} className={styles.amenityTag}>
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <button
              className={styles.galleryBtn}
              onClick={handleOpenModal}
              aria-label={t("villas.buttons.viewGallery")}
            >
              {t("villas.buttons.viewGallery")}
            </button>
            <a
              href="https://www.airbnb.com/users/show/549621434"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btn}
            >
              {t("villas.buttons.bookNow")}
            </a>
          </div>
        </div>
      </div>

      <VillaGalleryModal
        villa={villa}
        images={villa.galleryImages || []}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
