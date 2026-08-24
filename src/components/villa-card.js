"use client";

import { useState } from "react";
import Link from "next/link";
import ImageCarousel from "./image-carousel";
import VillaGalleryModal from "./villa-gallery-modal";
import CmsText from "@/components/cms-text";
import { villaImageCaption } from "@/lib/villa-gallery";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import {
  trackAirbnbRedirectClicked,
  trackVillaCardExpanded,
} from "@/lib/posthog";
import styles from "./villa-card.module.css";

export default function VillaCard({ villa }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const gallery = villa.galleryImages?.length
    ? villa.galleryImages
    : [villa.image].filter(Boolean);
  const captions = gallery.map((src) => villaImageCaption(src, villa, t));
  const bookHref = villa.slug
    ? `/villas/${villa.slug}`
    : `/contact?subject=booking&villa=${villa.id || ""}`;

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

  const handleBookClick = () => {
    // Keep analytics event name for continuity; destination is now native booking.
    trackAirbnbRedirectClicked({
      villa_id: villa.id,
      villa_name: villa.name,
      destination_url: bookHref,
    });
  };

  return (
    <>
    <div className={styles.card} id={`villa-${villa.id}`}>
      <div className={styles.imageContainer}>
        <ImageCarousel
          images={gallery}
          alt={villa.name}
          onImageClick={(index) => {
            setModalIndex(index);
            setIsModalOpen(true);
          }}
        />
      </div>

      <div className={styles.content}>
        <h3>
          {villa.slug ? (
            <Link href={`/villas/${villa.slug}`} className={styles.titleLink}>
              <CmsText fromCms={villa.nameFromCms}>{villa.name}</CmsText>
            </Link>
          ) : (
            <CmsText fromCms={villa.nameFromCms}>{villa.name}</CmsText>
          )}
        </h3>
        <p className={styles.description}>
          <CmsText fromCms={villa.descriptionFromCms}>
            {villa.description}
          </CmsText>
        </p>

        <button
          type="button"
          data-track="villa-details-toggle"
          data-villa-id={villa.id}
          data-villa-name={villa.name}
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
            {villa.informativeFact && !villa.descriptionFromCms && (
              <p className={styles.informativeFact}>
                <CmsText fromCms={false}>{villa.informativeFact}</CmsText>
              </p>
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
                      const parkingTranslations = [
                        "parking", "estacionamiento", "parkplatz", "parkeren", "駐車場"
                      ];
                      const amenityLower = amenity.toLowerCase().trim();
                      const isParking = parkingTranslations.some((translation) =>
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
          {villa.slug ? (
            <Link
              href={`/villas/${villa.slug}`}
              className={styles.galleryBtn}
              aria-label={t("villas.buttons.viewVilla")}
            >
              {t("villas.buttons.viewVilla")}
            </Link>
          ) : null}
          <Link
            href={bookHref}
            className={styles.btn}
            onClick={handleBookClick}
          >
            {t("villas.buttons.bookNow")}
          </Link>
        </div>
      </div>
    </div>
    <VillaGalleryModal
      villa={villa}
      images={gallery}
      captions={captions}
      startIndex={modalIndex}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
    </>
  );
}
