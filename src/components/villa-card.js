"use client";

import { useState } from "react";
import VillaGalleryModal from "./villa-gallery-modal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import {
  AIRBNB_PROFILE_URL,
  trackAirbnbRedirectClicked,
  trackVillaCardExpanded,
} from "@/lib/posthog";
import styles from "./villa-card.module.css";

export default function VillaCard({ villa }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (next) {
        trackVillaCardExpanded({
          villa_id: villa.id,
          villa_name: villa.name,
          current_language: language,
        });
      }
      return next;
    });
  };

  const handleAirbnbClick = () => {
    trackAirbnbRedirectClicked({
      villa_id: villa.id,
      villa_name: villa.name,
      destination_url: AIRBNB_PROFILE_URL,
    });
  };

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

          <button
            type="button"
            className={styles.expandBtn}
            onClick={handleToggleExpand}
            aria-expanded={isExpanded}
          >
            {isExpanded
              ? t("villas.buttons.hideDetails")
              : t("villas.buttons.showDetails")}
          </button>

          {isExpanded && (
            <>
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
                  {villa.amenities.map((amenity, index) => {
                    // Check if this amenity is parking in any language
                    // Translations: Parking (EN/FR), Estacionamiento (ES/PT), Parkplatz (DE), Parkeren (NL), 駐車場 (JP)
                    const parkingTranslations = [
                      "parking", "estacionamiento", "parkplatz", "parkeren", "駐車場"
                    ];
                    const amenityLower = amenity.toLowerCase().trim();
                    const isParking = parkingTranslations.some(translation => 
                      amenityLower === translation.toLowerCase()
                    );
                    return (
                      <span key={index} className={styles.amenityTag}>
                        {amenity}
                        {isParking && <span className={styles.asterisk}> *</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
            </>
          )}

          <div className={styles.footer}>
            <button
              className={styles.galleryBtn}
              onClick={handleOpenModal}
              aria-label={t("villas.buttons.viewGallery")}
            >
              {t("villas.buttons.viewGallery")}
            </button>
            <a
              href={AIRBNB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btn}
              onClick={handleAirbnbClick}
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
