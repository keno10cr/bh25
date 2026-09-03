"use client";
import { useEffect, useRef, useState } from "react";
import ContactForm from "@/components/contact-form";
import ContactInfo from "@/components/contact-info";
import CmsText from "@/components/cms-text";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { resolveCopy } from "@/lib/cms-field";
import styles from "./contact.module.css";

export default function ContactClient({ copy }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const bannerRef = useRef(null);
  const imageRef = useRef(null);
  const [imageOffset, setImageOffset] = useState(0);
  const title = resolveCopy(copy?.title, t("contactPage.title"), language);
  const subtitle = resolveCopy(copy?.subtitle, t("contactPage.subtitle"), language);

  useEffect(() => {
    const handleScroll = () => {
      if (bannerRef.current && imageRef.current) {
        const rect = bannerRef.current.getBoundingClientRect();
        const bannerTop = rect.top + window.scrollY;
        const scrollPosition = window.scrollY;

        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const scrolled = scrollPosition - bannerTop;
          const rate = scrolled * 0.5;
          setImageOffset(rate);
        } else {
          setImageOffset(0);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <section className={styles.bannerSection} ref={bannerRef}>
        <div className={styles.bannerImageContainer}>
          <div
            className={styles.bannerImageWrapper}
            ref={imageRef}
            style={{ transform: `translateY(${imageOffset}px)` }}
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
