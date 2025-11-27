"use client";
import { useEffect, useRef, useState } from "react";
import ContactForm from "@/components/contact-form";
import ContactInfo from "@/components/contact-info";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./contact.module.css";

export default function ContactPage() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const bannerRef = useRef(null);
  const imageRef = useRef(null);
  const [imageOffset, setImageOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (bannerRef.current && imageRef.current) {
        const rect = bannerRef.current.getBoundingClientRect();
        const bannerTop = rect.top + window.scrollY;
        const scrollPosition = window.scrollY;

        // Only apply parallax when banner is in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const scrolled = scrollPosition - bannerTop;
          const rate = scrolled * 0.5; // Parallax speed - move image down as we scroll down
          setImageOffset(rate);
        } else {
          // Reset when out of viewport
          setImageOffset(0);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once on mount
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
              src="/info/miradorBHContact.jpg"
              alt={t("contact.bannerAlt")}
              className={styles.bannerImage}
            />
          </div>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>{t("contactPage.title")}</h1>
          <p>{t("contactPage.subtitle")}</p>
        </div>

        <div className={styles.content}>
          <ContactForm />
          <ContactInfo />
        </div>
      </div>
    </>
  );
}

