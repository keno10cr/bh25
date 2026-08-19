"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { AIRBNB_PROFILE_URL } from "@/lib/posthog";
import PortableBody from "@/components/portable-text";
import CmsText from "@/components/cms-text";
import ImageCarousel from "@/components/image-carousel";
import VillaGalleryModal from "@/components/villa-gallery-modal";
import { villaImageCaption } from "@/lib/villa-gallery";
import styles from "./villa-detail.module.css";

export default function VillaDetailView({ villa }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const description =
    villa.translationKey && !villa.descriptionBlocks
      ? t(`villas.${villa.translationKey}.description`)
      : villa.description;
  const fact =
    villa.translationKey && t(`villas.${villa.translationKey}.informativeFact`);
  const bookingUrl = villa.bookingUrl || AIRBNB_PROFILE_URL;
  const gallery = villa.galleryImages || villa.gallery || [];
  const captions = gallery.map((src) => villaImageCaption(src, villa, t));
  const amenities = Array.isArray(villa.amenities)
    ? villa.amenities.map((amenity) => {
        const translated = t(`villas.amenities.${amenity}`);
        return translated === `villas.amenities.${amenity}`
          ? amenity
          : translated;
      })
    : [];

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
        <p className={styles.meta}>
          {villa.bedrooms} {t("villas.details.bedrooms")} · {villa.bathrooms}{" "}
          {t("villas.details.bathrooms")} · {t("villas.details.maxPeople")}{" "}
          {villa.maxPeople || villa.capacity}
        </p>
      </header>
      {villa.descriptionBlocks ? (
        <PortableBody value={villa.descriptionBlocks} />
      ) : (
        <p className={styles.copy}>
          <CmsText fromCms={villa.descriptionFromCms}>{description}</CmsText>
        </p>
      )}
      {fact &&
        !villa.descriptionFromCms &&
        fact !== `villas.${villa.translationKey}.informativeFact` && (
        <p className={styles.fact}>
          <CmsText fromCms={false}>{fact}</CmsText>
        </p>
      )}
      {amenities.length > 0 && (
        <ul className={styles.amenities}>
          {amenities.map((amenity) => (
            <li key={amenity}>{amenity}</li>
          ))}
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
      <VillaGalleryModal
        villa={villa}
        images={gallery.length ? gallery : [villa.image].filter(Boolean)}
        captions={captions}
        startIndex={modalIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </article>
  );
}
