"use client";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import CmsText from "@/components/cms-text";
import { resolveCopy } from "@/lib/cms-field";
import styles from "./contact-info.module.css";

export default function ContactInfo({ copy }) {
    const { language } = useLanguage();
    const t = useTranslation(language);
    const infoTitle = resolveCopy(
        copy?.infoTitle,
        t("contactPage.contactInfo.title")
    );
    return (
        <div className={styles.infoContainer}>
            <h2>
                <CmsText fromCms={infoTitle.fromCms}>{infoTitle.value}</CmsText>
            </h2>

            <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                    <div className={styles.icon}>
                        <Image 
                            src="/info/address.png" 
                            alt="Address" 
                            width={80}
                            height={80}
                        />
                    </div>
                    <h3>{t("contactPage.contactInfo.address")}</h3>
                    <p>{t("contactPage.contactInfo.addressLine1")}</p>
                    <p>{t("contactPage.contactInfo.addressLine2")}</p>
                    <a
                        href="https://maps.app.goo.gl/fVczYNsY2TwfF23d6"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.addressLink}
                    >
                        {t("contactPage.contactInfo.viewOnMaps")}
                    </a>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.icon}>
                        <Image 
                            src="/info/hours.png" 
                            alt="Hours" 
                            width={80}
                            height={80}
                        />
                    </div>
                    <h3>{t("contactPage.contactInfo.hours")}</h3>
                    <p className={styles.hoursDays}>{t("contactPage.contactInfo.hoursDays")}</p>
                    <p className={styles.hoursTime}>{t("contactPage.contactInfo.hoursTime")}</p>
                    <p>{t("contactPage.contactInfo.hoursLine2")}</p>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.icon}>
                        <Image 
                            src="/info/email.png" 
                            alt="Email" 
                            width={80}
                            height={80}
                        />
                    </div>
                    <h3>{t("contactPage.contactInfo.email")}</h3>
                    <p>
                        <a href="mailto:blessedhousecr@gmail.com" className={styles.contactLink}>
                            blessedhousecr@gmail.com
                        </a>
                    </p>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.icon}>
                        <Image 
                            src="/info/phone.png" 
                            alt="Phone" 
                            width={80}
                            height={80}
                        />
                    </div>
                    <h3>{t("contactPage.contactInfo.phone")}</h3>
                    <p>
                        <a href="tel:+17546104710" className={styles.contactLink}>
                            +1 (754) 610-4710
                        </a>
                    </p>
                </div>
            </div>

            <div className={styles.directionsContainer}>
                <h3>{t("contactPage.contactInfo.howToGetHere")}</h3>
                <p>
                    {t("contactPage.contactInfo.directions")}
                </p>
                <p>
                    {t("contactPage.contactInfo.findOnMaps")} <strong>{t("contactPage.contactInfo.mapSearch")}</strong>
                </p>
                <a
                    href="https://maps.app.goo.gl/fVczYNsY2TwfF23d6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapLink}
                >
                    {t("contactPage.contactInfo.getDirections")}
                </a>
                <div className={styles.coordinatesContainer}>
                    <h4 className={styles.coordinatesTitle}>{t("contactPage.contactInfo.coordinatesTitle")}</h4>
                    <a
                        href="https://www.google.com/maps/place/9%C2%B038'50.5%22N+82%C2%B046'37.1%22W/@9.647346,-82.7795479,1066m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d9.647346!4d-82.776973?entry=ttu&g_ep=EgoyMDI1MTEyMy4xIKXMDSoASAFQAw%3D%3D"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.coordinatesLink}
                    >
                        9.647346, -82.776973
                    </a>
                </div>
            </div>

            <div className={styles.mapContainer}>
                <h3>{t("contactPage.contactInfo.findUsHere")}</h3>

                {/* <iframe src="" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe> */}

                <div className={styles.map}>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3933.3938841788026!2d-82.77954832426032!3d9.647345590440827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa65a801c5aaaab%3A0xfe3832c538d76ec3!2sBlessed%20House%20Puerto%20Viejo%20de%20Talamanca!5e0!3m2!1ses-419!2scr!4v1762142170514!5m2!1ses-419!2scr"
                        width="100%"
                        height="300"
                        style={{ border: 0, borderRadius: "12px" }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </div>
        </div>
    );
}
