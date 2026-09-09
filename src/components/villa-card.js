"use client";

import { useState } from "react";
import Link from "next/link";
import ImageCarousel from "./image-carousel";
import VillaGalleryModal from "./villa-gallery-modal";
import CmsText from "@/components/cms-text";
import { AmenityIcon, CheckIcon } from "@/components/amenity-icon";
import { mergeVillaGallery, villaImageCaption } from "@/lib/villa-gallery";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { trackAirbnbRedirectClicked } from "@/lib/posthog";
import { resolvePetsMax } from "@/lib/houseRules";
import styles from "./villa-card.module.css";

export default function VillaCard({ villa }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const gallery = mergeVillaGallery(villa);
  const captions = gallery.map((src) => villaImageCaption(src, villa, t));
  const bookHref = villa.slug
    ? `/villas/${villa.slug}`
    : `/contact?subject=booking&villa=${villa.id || ""}`;
  const petsWelcome = resolvePetsMax(villa) > 0;

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
      <div className={styles.imageBlock}>
        <ImageCarousel
          images={gallery}
          alt={villa.name}
          controlsPlacement="below"
          className={styles.imageContainer}
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

        {villa.informativeFact && !villa.descriptionFromCms && (
          <p className={styles.informativeFact}>
            <CmsText fromCms={false}>{villa.informativeFact}</CmsText>
          </p>
        )}

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <div
              className={styles.detailItem}
              aria-label={`${t("villas.details.bedrooms")} ${villa.bedrooms}`}
            >
              <span className={styles.detailIcon}>
                <AmenityIcon name="bedrooms" />
              </span>
              <span className={styles.detailValue}>{villa.bedrooms}</span>
            </div>
            <div
              className={styles.detailItem}
              aria-label={`${t("villas.details.bathrooms")} ${villa.bathrooms}`}
            >
              <span className={styles.detailIcon}>
                <AmenityIcon name="bathrooms" />
              </span>
              <span className={styles.detailValue}>{villa.bathrooms}</span>
            </div>
            <div
              className={styles.detailItem}
              aria-label={`${t("villas.details.maxPeople")} ${villa.maxPeople}`}
            >
              <span className={styles.detailIcon}>
                <AmenityIcon name="people" />
              </span>
              <span className={styles.detailValue}>{villa.maxPeople}</span>
            </div>
            {petsWelcome ? (
              <div
                className={styles.detailItem}
                aria-label={t("villas.details.pets")}
              >
                <span className={styles.detailIcon}>
                  <AmenityIcon name="pets" />
                </span>
                <span className={styles.detailCheck}>
                  <CheckIcon />
                </span>
              </div>
            ) : null}
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

        <div className={styles.footer}>
          <Link
            href={bookHref}
            className={styles.btn}
            onClick={handleBookClick}
          >
            {t("villas.buttons.checkAvailability")}
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
