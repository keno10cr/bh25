"use client";
import { useRef } from "react";
import ContactForm from "@/components/contact-form";
import ContactInfo from "@/components/contact-info";
import CmsText from "@/components/cms-text";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { resolveCopy } from "@/lib/cms-field";
import { useSmoothParallax } from "@/lib/parallax-motion";
import styles from "./contact.module.css";

export default function ContactClient({ copy }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const bannerRef = useRef(null);
  const imageRef = useRef(null);
  const title = resolveCopy(copy?.title, t("contactPage.title"), language);
  const subtitle = resolveCopy(copy?.subtitle, t("contactPage.subtitle"), language);

  useSmoothParallax((loop) => {
    const banner = bannerRef.current;
    if (!banner) return;
    const rect = banner.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
      loop.set(imageRef.current, { y: 0, lerp: 0.2 });
      return;
    }
    loop.set(imageRef.current, { y: -rect.top * 0.45, lerp: 0.16 });
  }, []);

  return (
    <>
      <section className={styles.bannerSection} ref={bannerRef}>
        <div className={styles.bannerImageContainer}>
          <div
            className={styles.bannerImageWrapper}
            ref={imageRef}
          >
            <img
              src={copy?.heroImage?.value || "/info/miradorBHContact.jpg"}
              alt={copy?.heroImageAlt?.value || t("contact.bannerAlt")}
              className={styles.bannerImage}
            />
          </div>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>
            <CmsText fromCms={title.fromCms}>{title.value}</CmsText>
          </h1>
          <p>
            <CmsText fromCms={subtitle.fromCms}>{subtitle.value}</CmsText>
          </p>
        </div>

        <div className={styles.content}>
          <ContactForm copy={copy} />
          <ContactInfo copy={copy} />
        </div>
      </div>
    </>
  );
}
