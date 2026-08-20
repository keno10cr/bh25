"use client";

import { useState } from "react";
import ReviewsMarquee from "@/components/reviews-marquee";
import FeedbackModal from "@/components/feedback-modal";
import CmsText from "@/components/cms-text";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { resolveCopy } from "@/lib/cms-field";
import styles from "./reviews-section.module.css";

export default function ReviewsSection({ reviews, copy }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [open, setOpen] = useState(false);
  const title = resolveCopy(copy?.reviewsTitle, t("reviews.title"), language);
  const subtitle = resolveCopy(
    copy?.reviewsSubtitle,
    t("reviews.subtitle"),
    language
  );

  return (
    <>
      <ReviewsMarquee
        reviews={reviews}
        title={<CmsText fromCms={title.fromCms}>{title.value}</CmsText>}
        subtitle={
          <CmsText fromCms={subtitle.fromCms}>{subtitle.value}</CmsText>
        }
        ariaLabel={title.value}
      />
      <div className={styles.ctaWrap}>
        <button type="button" className={styles.cta} onClick={() => setOpen(true)}>
          {t("feedback.cta")}
        </button>
      </div>
      <FeedbackModal
        open={open}
        onClose={() => setOpen(false)}
        formType="guestExperience"
      />
    </>
  );
}
