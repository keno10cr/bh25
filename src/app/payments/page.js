"use client";

import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import Image from "next/image";
import styles from "./payments.module.css";

export default function PaymentsPage() {
  const { language, changeLanguage } = useLanguage();
  const t = useTranslation(language);

  // Only show in English and Spanish - switch to English if other language is selected
  useEffect(() => {
    if (language !== "en" && language !== "es") {
      changeLanguage("en");
    }
  }, [language, changeLanguage]);

  // Use English if unsupported language is selected
  const displayLanguage = language === "en" || language === "es" ? language : "en";
  const t_display = useTranslation(displayLanguage);

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <Image
          src="/blessedhouse_logo25.png"
          alt="Blessed House Logo"
          width={150}
          height={150}
          className={styles.logo}
        />
      </div>

      <div className={styles.header}>
        <h1>{t_display("payments.title")}</h1>
      </div>

      <div className={styles.accountInfo}>
        <p className={styles.subtitle}>{t_display("payments.accountName")}</p>
        <p className={styles.subtitle}>{t_display("payments.cedulaJuridica")}</p>
      </div>

      <div className={styles.bankSection}>
        <h2 className={styles.bankName}>{t_display("payments.bankNacional.title")}</h2>
        <table className={styles.accountTable}>
          <thead>
            <tr>
              <th>{t_display("payments.table.currency")}</th>
              <th>{t_display("payments.table.accountNumber")}</th>
              <th>{t_display("payments.table.iban")}</th>
              <th>{t_display("payments.table.type")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t_display("payments.bankNacional.colones.currency")}</td>
              <td>{t_display("payments.bankNacional.colones.accountNumber")}</td>
              <td>{t_display("payments.bankNacional.colones.iban")}</td>
              <td>{t_display("payments.bankNacional.colones.type")}</td>
            </tr>
            <tr>
              <td>{t_display("payments.bankNacional.dolares.currency")}</td>
              <td>{t_display("payments.bankNacional.dolares.accountNumber")}</td>
              <td>{t_display("payments.bankNacional.dolares.iban")}</td>
              <td>{t_display("payments.bankNacional.dolares.type")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.bankSection}>
        <h2 className={styles.bankName}>{t_display("payments.bankBAC.title")}</h2>
        <table className={styles.accountTable}>
          <thead>
            <tr>
              <th>{t_display("payments.table.currency")}</th>
              <th>{t_display("payments.table.accountNumber")}</th>
              <th>{t_display("payments.table.iban")}</th>
              <th>{t_display("payments.table.type")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t_display("payments.bankBAC.colones.currency")}</td>
              <td>{t_display("payments.bankBAC.colones.accountNumber")}</td>
              <td>{t_display("payments.bankBAC.colones.iban")}</td>
              <td>{t_display("payments.bankBAC.colones.type")}</td>
            </tr>
            <tr>
              <td>{t_display("payments.bankBAC.dolares.currency")}</td>
              <td>{t_display("payments.bankBAC.dolares.accountNumber")}</td>
              <td>{t_display("payments.bankBAC.dolares.iban")}</td>
              <td>{t_display("payments.bankBAC.dolares.type")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.sinpeContainer}>
        <div className={styles.sinpeWrapper}>
          <Image
            src="/info/PagosTiempoRealSinpeMovilbccr.gif"
            alt="Pagos Tiempo Real Sinpe Movil"
            width={90}
            height={60}
            className={styles.sinpeLogo}
          />
        </div>
      </div>

      <div className={styles.contactInfo}>
        <p className={styles.tel}>{t_display("payments.tel")}</p>
        <p className={styles.contactSubtitle}>{t_display("payments.contactSubtitle")}</p>
        <p className={styles.contactText}>{t_display("payments.contactText")}</p>
      </div>

      <footer className={styles.footer}>
        <p>{t_display("payments.footer")}</p>
      </footer>
    </div>
  );
}

