"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { AIRBNB_PROFILE_URL } from "@/lib/posthog";
import PortableBody from "@/components/portable-text";
import CmsText from "@/components/cms-text";
import ImageCarousel from "@/components/image-carousel";
import VillaGalleryModal from "@/components/villa-gallery-modal";
import FeedbackModal from "@/components/feedback-modal";
import { AmenityIcon } from "@/components/amenity-icon";
import { villaImageCaption } from "@/lib/villa-gallery";
import styles from "./villa-detail.module.css";

export default function VillaDetailView({ villa, reviews = [] }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const description =
    villa.translationKey && (language !== "en" || !villa.descriptionBlocks)
      ? t(`villas.${villa.translationKey}.description`)
      : villa.description;
  const useTranslatedBody =
    Boolean(villa.translationKey) &&
    (language !== "en" || !villa.descriptionFromCms);
  const fact =
    villa.translationKey && t(`villas.${villa.translationKey}.informativeFact`);
  const bookingUrl = villa.bookingUrl || AIRBNB_PROFILE_URL;
  const gallery = villa.galleryImages || villa.gallery || [];
  const captions = gallery.map((src) => villaImageCaption(src, villa, t));
  const amenityKeys = useMemo(
    () =>
      (Array.isArray(villa.amenities) ? villa.amenities : []).filter(
        (amenity) => !String(amenity).startsWith("bedInfo")
      ),
    [villa.amenities]
  );

  const openGallery = (index) => {
    setModalIndex(index);
    setIsModalOpen(true);
  };

  return (
    <article className={styles.page}>
      <Link href="/villas" className={styles.back}>
        ← {t("featuredVillas.viewAll")}
      </Link>
      <div className={styles.hero}>
        <ImageCarousel
          images={gallery.length ? gallery : [villa.image].filter(Boolean)}
          alt={villa.name}
          onImageClick={openGallery}
        />
      </div>
      <header>
        <h1>
          <CmsText fromCms={villa.nameFromCms}>{villa.name}</CmsText>
        </h1>
        <div className={styles.badges}>
          <span className={styles.badge}>
            <AmenityIcon name="bedrooms" />
            <strong>{villa.bedrooms}</strong>
            <em>{t("villas.details.bedrooms")}</em>
          </span>
          <span className={styles.badge}>
            <AmenityIcon name="bathrooms" />
            <strong>{villa.bathrooms}</strong>
            <em>{t("villas.details.bathrooms")}</em>
          </span>
          <span className={styles.badge}>
            <AmenityIcon name="people" />
            <strong>{villa.maxPeople || villa.capacity}</strong>
            <em>{t("villas.details.maxPeople")}</em>
          </span>
        </div>
      </header>
      {villa.descriptionBlocks && language === "en" ? (
        <PortableBody value={villa.descriptionBlocks} />
      ) : (
        <p className={styles.copy}>
          <CmsText fromCms={!useTranslatedBody && villa.descriptionFromCms}>
            {description}
          </CmsText>
        </p>
      )}
      {fact &&
        (language !== "en" || !villa.descriptionFromCms) &&
        fact !== `villas.${villa.translationKey}.informativeFact` && (
          <p className={styles.fact}>
            <CmsText fromCms={false}>{fact}</CmsText>
          </p>
        )}
      {amenityKeys.length > 0 && (
        <ul className={styles.amenities}>
          {amenityKeys.map((amenity) => {
            const label = t(`villas.amenities.${amenity}`);
            return (
              <li key={amenity}>
                <AmenityIcon name={amenity} />
                <span>
                  {label === `villas.amenities.${amenity}` ? amenity : label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {gallery.length > 1 && (
        <div className={styles.gallery}>
          {gallery.map((src, index) => (
            <button
              key={src}
              type="button"
              className={styles.thumb}
              onClick={() => openGallery(index)}
            >
              <img src={src} alt={captions[index] || villa.name} />
            </button>
          ))}
        </div>
      )}
      <a
        href={bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.book}
      >
        {t("villas.buttons.bookNow")}
      </a>

      <section className={styles.reviews}>
        <h2>{t("feedback.villaReviewsTitle")}</h2>
        {reviews.length ? (
          <ul className={styles.reviewList}>
            {reviews.map((review) => (
              <li key={review.id}>
                <div className={styles.reviewMeta}>
                  <strong>{review.guestName}</strong>
                  {review.rating ? <span>{"★".repeat(review.rating)}</span> : null}
                </div>
                <p>{review.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.reviewEmpty}>{t("feedback.villaReviewsEmpty")}</p>
        )}
        <button
          type="button"
          className={styles.reviewCta}
          onClick={() => setFeedbackOpen(true)}
        >
          {t("feedback.villaCta")}
        </button>
      </section>

      <VillaGalleryModal
        villa={villa}
        images={gallery.length ? gallery : [villa.image].filter(Boolean)}
        captions={captions}
        startIndex={modalIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        formType="villaComment"
        villaId={villa.slug}
        villaName={villa.name}
      />
    </article>
  );
}
