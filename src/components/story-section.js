"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import CmsText from "@/components/cms-text";
import { resolveCopy } from "@/lib/cms-field";
import styles from "./story-section.module.css";

export default function StorySection({ copy }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const eyebrow = resolveCopy(copy?.storyEyebrow, t("story.eyebrow"), language);
  const title = resolveCopy(copy?.storyTitle, t("story.title"), language);
  const body = resolveCopy(copy?.storyBody, t("story.body"), language);
  const paragraphs = String(body.value || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section className={styles.section} aria-labelledby="story-title">
      <div className={styles.container}>
        <div className={styles.media}>
          <img
            src={copy?.storyImage?.value || "/gallery/BHViews.jpg"}
            alt={
              copy?.storyImageAlt?.value ||
              "Rainforest canopy around Blessed House in Puerto Viejo, Costa Rica"
            }
            className={styles.image}
            loading="lazy"
          />
        </div>
        <div className={styles.text}>
          <p className={styles.eyebrow}>
            <CmsText fromCms={eyebrow.fromCms}>{eyebrow.value}</CmsText>
          </p>
          <h2 id="story-title" className={styles.title}>
            <CmsText fromCms={title.fromCms}>{title.value}</CmsText>
          </h2>
          {paragraphs.map((paragraph, index) => (
            <p key={index} className={styles.body}>
              <CmsText fromCms={body.fromCms}>{paragraph}</CmsText>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
