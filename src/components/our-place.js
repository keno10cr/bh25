"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import CmsText from "@/components/cms-text";
import { resolveCopy } from "@/lib/cms-field";
import styles from "./our-place.module.css";

export default function OurPlace({ copy }) {
    const { language } = useLanguage();
    const t = useTranslation(language);
    const title = resolveCopy(copy?.ourPlaceTitle, t("ourPlace.title"), language);
    const description = resolveCopy(
        copy?.ourPlaceDescription,
        t("ourPlace.description"),
        language
    );
    const cta = resolveCopy(copy?.ourPlaceCta, t("ourPlace.contactUs"), language);
    const imageRef = useRef(null);
    const sectionRef = useRef(null);
    const [imageOffset, setImageOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (sectionRef.current && imageRef.current) {
                const rect = sectionRef.current.getBoundingClientRect();
                const sectionTop = rect.top + window.scrollY;
                const scrollPosition = window.scrollY;

                // Only apply parallax when section is in viewport
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const scrolled = scrollPosition - sectionTop;
                    const rate = scrolled * 0.3; // Move image down as we scroll down
                    setImageOffset(rate);
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Call once on mount
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className={styles.section} ref={sectionRef}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.imageWrapper}>
                        <div
                            className={styles.imageContainer}
                            ref={imageRef}
                            style={{ transform: `translateY(${imageOffset}px)` }}
                        >
                            <img
                                src={copy?.ourPlaceImage?.value || "/villas/general/junglepool.jpg"}
                                alt={
                                    copy?.ourPlaceImageAlt?.value ||
                                    "Blessed House pool area"
                                }
                                className={styles.image}
                            />
                        </div>
                    </div>
                    <div className={styles.textContent}>
                        <h2>
                            <CmsText fromCms={title.fromCms}>{title.value}</CmsText>
                        </h2>
                        <p>
                            <CmsText fromCms={description.fromCms}>
                                {description.value}
                            </CmsText>
                        </p>
                        <Link href="/contact" className={styles.ctaButton}>
                            <CmsText fromCms={cta.fromCms}>{cta.value}</CmsText>
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
