"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import CmsText from "@/components/cms-text";
import { resolveCopy } from "@/lib/cms-field";
import styles from "./welcome-section.module.css";

export default function WelcomeSection({ copy }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const title = resolveCopy(copy?.welcomeTitle, t("welcome.title"), language);
  const description = resolveCopy(
    copy?.welcomeDescription,
    t("welcome.description"),
    language
  );
  const videoBy = resolveCopy(copy?.welcomeVideoBy, t("welcome.videoBy"), language);
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>
            <CmsText fromCms={title.fromCms}>{title.value}</CmsText>
          </h2>
          <div className={styles.logoContainer}>
            <Image
              src="/blessedhouse_logo25.png"
              alt="Blessed House Logo"
              width={150}
              height={150}
              className={styles.logo}
            />
          </div>
          <p>
            <CmsText fromCms={description.fromCms}>{description.value}</CmsText>
          </p>
          <div className={styles.videoContainer}>
            <div className={styles.videoWrapper}>
              <iframe
                src="https://www.youtube.com/embed/nwga2GnnoMM?rel=0&modestbranding=1"
                title="Welcome to Blessed House"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className={styles.video}
              ></iframe>
            </div>
            <p className={styles.videoCredit}>
              <CmsText fromCms={videoBy.fromCms}>{videoBy.value}</CmsText>{" "}
              <a
                href="https://www.instagram.com/dazelg/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.videoLink}
              >
                dazelg
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
