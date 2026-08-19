"use client";

import ReviewsMarquee from "@/components/reviews-marquee";
import CmsText from "@/components/cms-text";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { resolveCopy } from "@/lib/cms-field";

export default function ReviewsSection({ reviews, copy }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const title = resolveCopy(copy?.reviewsTitle, t("reviews.title"));
  const subtitle = resolveCopy(copy?.reviewsSubtitle, t("reviews.subtitle"));

  return (
    <ReviewsMarquee
      reviews={reviews}
      title={<CmsText fromCms={title.fromCms}>{title.value}</CmsText>}
      subtitle={
        <CmsText fromCms={subtitle.fromCms}>{subtitle.value}</CmsText>
      }
      ariaLabel={title.value}
    />
  );
}
