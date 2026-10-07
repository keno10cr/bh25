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
  const villaNumber = String(villa.name || "").match(/#\s*(\d+)/)?.[1] ||
    String(villa.slug || "").match(/^villa-(\d+)/)?.[1];
  const detailsLabel = villaNumber
    ? t("villas.buttons.fullDetailsNumbered").replace("{number}", villaNumber)
    : t("villas.buttons.fullDetails");

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

        {villa.informativeFact && (
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

          {villa.bedList?.length > 0 && (
            <ul className={styles.bedList} aria-label={t("villas.details.houseArrangements")}>
              {villa.bedList.map((room, index) =>
                typeof room === "string" ? (
                  <li key={index}>{room}</li>
                ) : (
                  <li key={index}>
                    <span className={styles.roomTitle}>{room.title}</span>
                    <span className={styles.roomBeds}>{room.beds}</span>
                  </li>
                )
              )}
            </ul>
          )}

          {villa.amenities && villa.amenities.length > 0 && (
            <div className={styles.amenities}>
              <span className={styles.amenitiesLabel}>{t("villas.details.amenities")}</span>
              <div className={styles.amenitiesList}>
                {villa.amenities.map((amenity, index) => {
                  const label = typeof amenity === "string" ? amenity : amenity.label;
                  const key = typeof amenity === "string" ? amenity : amenity.key;
                  const isParking = String(key).trim().toLowerCase() === "parking";
                  return (
                    <span key={index} className={styles.amenityTag}>
                      <AmenityIcon name={key} />
                      {label}
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
            aria-label={villa.name ? `${detailsLabel}: ${villa.name}` : undefined}
          >
            {detailsLabel}
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
