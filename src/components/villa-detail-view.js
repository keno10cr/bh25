"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import PortableBody from "@/components/portable-text";
import CmsText from "@/components/cms-text";
import ImageCarousel from "@/components/image-carousel";
import VillaGalleryModal from "@/components/villa-gallery-modal";
import FeedbackModal from "@/components/feedback-modal";
import PropertyBookingSidebar from "@/components/property-booking-sidebar";
import ReviewsMarquee from "@/components/reviews-marquee";
import { AmenityIcon } from "@/components/amenity-icon";
import { villaImageCaption } from "@/lib/villa-gallery";
import {
  resolveBaseGuestCount,
  resolveExtraGuestFeePerNight,
  resolveMinimumNights,
} from "@/lib/propertyPricing";
import {
  getOrderedHouseRuleCards,
  resolvePetsMax,
} from "@/lib/houseRules";
import styles from "./villa-detail.module.css";

export default function VillaDetailView({ villa, property = null, reviews = [] }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const description =
    property?.shortDescription && language === "en"
      ? property.shortDescription
      : villa.translationKey && (language !== "en" || !villa.descriptionBlocks)
        ? t(`villas.${villa.translationKey}.description`)
        : villa.description;
  const useTranslatedBody =
    Boolean(villa.translationKey) &&
    (language !== "en" || !villa.descriptionFromCms) &&
    !(property?.shortDescription && language === "en");
  const fact =
    villa.translationKey && t(`villas.${villa.translationKey}.informativeFact`);
  const gallery =
    property?.gallery?.length > 0
      ? property.gallery
      : villa.galleryImages || villa.gallery || [];
  const heroFallback = property?.heroImage || villa.image;
  const captions = gallery.map((src) => villaImageCaption(src, villa, t));
  const amenitySource =
    property?.amenities?.length > 0 ? property.amenities : villa.amenities;
  const amenityKeys = useMemo(
    () =>
      (Array.isArray(amenitySource) ? amenitySource : []).filter(
        (amenity) => !String(amenity).startsWith("bedInfo")
      ),
    [amenitySource]
  );
  const includedGuests = property
    ? resolveBaseGuestCount(property)
    : null;
  const extraFee = property
    ? resolveExtraGuestFeePerNight(property)
    : 0;
  const minNights = property ? resolveMinimumNights(property) : 1;

  const houseRuleCards = useMemo(
    () => getOrderedHouseRuleCards(property, t),
    [property, t]
  );

  const petsMax = resolvePetsMax(property);

  const openGallery = (index) => {
    setModalIndex(index);
    setIsModalOpen(true);
  };

  const arrangements = property?.houseArrangements || [];

  return (
    <article className={styles.page}>
      <Link href="/villas" className={styles.back}>
        ← {t("featuredVillas.viewAll")}
      </Link>
      <div className={styles.hero}>
        <ImageCarousel
          images={gallery.length ? gallery : [heroFallback].filter(Boolean)}
          alt={property?.name || villa.name}
          onImageClick={openGallery}
          parallax
        />
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>
          <header>
            {property?.locationLabel ? (
              <p className={styles.location}>
                {property.locationLabel}
                {property.regionEn ? `, ${property.regionEn}` : ""}
              </p>
            ) : null}
            <h1>
              <CmsText fromCms={Boolean(property?.name) || villa.nameFromCms}>
                {property?.name || villa.name}
              </CmsText>
            </h1>
            <div className={styles.badges}>
              <span className={styles.badge}>
                <AmenityIcon name="bedrooms" />
                <strong>{property?.bedrooms || villa.bedrooms}</strong>
                <em>{t("villas.details.bedrooms")}</em>
              </span>
              <span className={styles.badge}>
                <AmenityIcon name="bathrooms" />
                <strong>{property?.bathrooms ?? villa.bathrooms}</strong>
                <em>{t("villas.details.bathrooms")}</em>
              </span>
              <span className={styles.badge}>
                <AmenityIcon name="people" />
                <strong>
                  {property?.guestsMax || villa.maxPeople || villa.capacity}
                </strong>
                <em>{t("villas.details.maxPeople")}</em>
              </span>
              {petsMax > 0 ? (
                <span className={styles.badge}>
                  <strong>{t("villas.houseRules.petsWelcome")}</strong>
                </span>
              ) : null}
            </div>
          </header>

          <section className={styles.section}>
            <h2>About this property</h2>
            {villa.descriptionBlocks && language === "en" && !property?.shortDescription ? (
              <PortableBody value={villa.descriptionBlocks} />
            ) : (
              <p className={styles.copy}>
                <CmsText
                  fromCms={
                    Boolean(property?.shortDescription) ||
                    (!useTranslatedBody && villa.descriptionFromCms)
                  }
                >
                  {description}
                </CmsText>
              </p>
            )}
            {property ? (
              <p className={styles.fact}>
                The nightly rate includes {includedGuests} guest
                {includedGuests === 1 ? "" : "s"}
                {extraFee > 0
                  ? `. Extra adults or children add $${extraFee} per night.`
                  : "."}{" "}
                Maximum occupancy is {property.guestsMax}. Minimum stay is{" "}
                {minNights} night{minNights === 1 ? "" : "s"} for online Reserve.
              </p>
            ) : null}
            {fact &&
              (language !== "en" || !villa.descriptionFromCms) &&
              fact !== `villas.${villa.translationKey}.informativeFact` && (
                <p className={styles.fact}>
                  <CmsText fromCms={false}>{fact}</CmsText>
                </p>
              )}
          </section>

          {arrangements.length > 0 ? (
            <section className={styles.section}>
              <h2>{t("villas.details.houseArrangements")}</h2>
              <div className={styles.arrangementGrid}>
                {arrangements.map((row, index) => {
                  const title =
                    (language === "es"
                      ? row.customTitleEs || row.roomType?.titleEs
                      : null) ||
                    row.customTitleEn ||
                    row.roomType?.titleEn ||
                    "Sleeping space";
                  const bedConfig =
                    (language === "es"
                      ? row.roomType?.configEs
                      : row.roomType?.configEn) ||
                    row.roomType?.configEn;
                  const qty = row.quantity > 1 ? `${row.quantity} × ` : "";
                  return (
                    <div key={`${title}-${index}`} className={styles.arrangementCard}>
                      <strong>
                        {qty}
                        {title}
                      </strong>
                      <span>
                        {t("villas.details.sleeps")} {row.roomType?.capacity || "?"}
                        {bedConfig ? ` · ${bedConfig}` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {amenityKeys.length > 0 && (
            <section className={styles.section}>
              <h2>{t("villas.details.amenities")}</h2>
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
            </section>
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

          <section className={`${styles.section} ${styles.rulesSection}`}>
            <h2>{t("villas.details.houseRules")}</h2>
            <div className={styles.rulesStack}>
              {houseRuleCards.map((rule) => (
                <article key={rule.key} className={styles.ruleCard}>
                  <h3 className={styles.ruleTitle}>{rule.title}</h3>
                  <div className={styles.ruleBody}>
                    <PortableBody value={rule.body} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.reviews}>
            {reviews.length ? (
              <ReviewsMarquee
                reviews={reviews}
                rowCount={1}
                embedded
                title={t("feedback.villaReviewsTitle")}
                subtitle=""
                ariaLabel={t("feedback.villaReviewsTitle")}
              />
            ) : (
              <>
                <h2>{t("feedback.villaReviewsTitle")}</h2>
                <p className={styles.reviewEmpty}>{t("feedback.villaReviewsEmpty")}</p>
              </>
            )}
            <div className={styles.reviewCtaWrap}>
              <button
                type="button"
                className={styles.reviewCta}
                onClick={() => setFeedbackOpen(true)}
              >
                {t("feedback.villaCta")}
              </button>
            </div>
          </section>
        </div>

        <div className={styles.sidebar}>
          {property ? (
            <PropertyBookingSidebar
              property={property}
              reviews={reviews}
              villaNumericId={villa.id}
            />
          ) : (
            <div className={styles.fallbackCard}>
              <p>
                Booking calendar is preparing for this villa. You can still send an
                inquiry.
              </p>
              <Link
                className={styles.book}
                href={`/contact?subject=booking&villa=${villa.id || ""}`}
              >
                Inquire
              </Link>
            </div>
          )}
        </div>
      </div>

      <VillaGalleryModal
        villa={villa}
        images={gallery.length ? gallery : [heroFallback].filter(Boolean)}
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
