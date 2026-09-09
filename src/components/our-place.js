"use client";

import { useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import CmsText from "@/components/cms-text";
import { resolveCopy } from "@/lib/cms-field";
import { useSmoothParallax } from "@/lib/parallax-motion";
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

    useSmoothParallax((loop) => {
        const section = sectionRef.current;
        if (!section) return;
        const rect = section.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
        loop.set(imageRef.current, { y: -rect.top * 0.28, lerp: 0.16 });
    }, []);

    return (
        <section className={styles.section} ref={sectionRef}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.imageWrapper}>
                        <div
                            className={styles.imageContainer}
                            ref={imageRef}
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
