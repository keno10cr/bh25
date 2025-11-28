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

      <div className={styles.bankSection}>
        <h2 className={styles.bankName}>{t_display("payments.bankBAC.title")}</h2>
        <table className={styles.accountTable}>
          <tbody>
            <tr>
              <td>{t_display("payments.labels.nombre")}</td>
              <td>{t_display("payments.bankBAC.nombre")}</td>
            </tr>
            <tr>
              <td>{t_display("payments.labels.cedulaJuridica")}</td>
              <td>{t_display("payments.bankBAC.cedulaJuridica")}</td>
            </tr>
            <tr>
              <td>{t_display("payments.labels.sinpe")}</td>
              <td>{t_display("payments.bankBAC.sinpe")}</td>
            </tr>
            <tr>
              <td>{t_display("payments.labels.ibanColones")}</td>
              <td>{t_display("payments.bankBAC.ibanColones")}</td>
            </tr>
            <tr>
              <td>{t_display("payments.labels.ibanDolares")}</td>
              <td>{t_display("payments.bankBAC.ibanDolares")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.bankSection}>
        <h2 className={styles.bankName}>{t_display("payments.bankNacional.title")}</h2>
        <table className={styles.accountTable}>
          <tbody>
            <tr>
              <td>{t_display("payments.labels.nombre")}</td>
              <td>{t_display("payments.bankNacional.nombre")}</td>
            </tr>
            <tr>
              <td>{t_display("payments.labels.cedulaJuridica")}</td>
              <td>{t_display("payments.bankNacional.cedulaJuridica")}</td>
            </tr>
            <tr>
              <td>{t_display("payments.labels.sinpe")}</td>
              <td>{t_display("payments.bankNacional.sinpe")}</td>
            </tr>
            <tr>
              <td>{t_display("payments.labels.ibanColones")}</td>
              <td>{t_display("payments.bankNacional.ibanColones")}</td>
            </tr>
            <tr>
              <td>{t_display("payments.labels.ibanDolares")}</td>
              <td>{t_display("payments.bankNacional.ibanDolares")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.bankSection}>
        <h2 className={styles.bankName}>{t_display("payments.bankBCR.title")}</h2>
        <table className={styles.accountTable}>
          <tbody>
            <tr>
              <td>{t_display("payments.labels.nombre")}</td>
              <td>{t_display("payments.bankBCR.nombre")}</td>
            </tr>
            <tr>
              <td>{t_display("payments.labels.cedulaJuridica")}</td>
              <td>{t_display("payments.bankBCR.cedulaJuridica")}</td>
            </tr>
            <tr>
              <td>{t_display("payments.labels.ibanColones")}</td>
              <td>{t_display("payments.bankBCR.ibanColones")}</td>
            </tr>
            <tr>
              <td>{t_display("payments.labels.ibanDolares")}</td>
              <td>{t_display("payments.bankBCR.ibanDolares")}</td>
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
        <p className={styles.contactText}>
          {(() => {
            const text = t_display("payments.contactText");
            const phonePattern = /\+1\s?\(?\d{3}\)?\s?\d{3}[-.]?\d{4}/g;
            const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
            
            // Find all matches with their positions
            const allMatches = [];
            let match;
            
            while ((match = phonePattern.exec(text)) !== null) {
              allMatches.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0]
              });
            }
            
            while ((match = emailPattern.exec(text)) !== null) {
              allMatches.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0]
              });
            }
            
            // Sort by position
            allMatches.sort((a, b) => a.start - b.start);
            
            // Build JSX elements
            const result = [];
            let lastIndex = 0;
            
            allMatches.forEach((match, index) => {
              // Add text before this match
              if (match.start > lastIndex) {
                result.push(text.substring(lastIndex, match.start));
              }
              // Add bold match
              result.push(<strong key={`bold-${index}`}>{match.text}</strong>);
              lastIndex = match.end;
            });
            
            // Add remaining text
            if (lastIndex < text.length) {
              result.push(text.substring(lastIndex));
            }
            
            return result.length > 0 ? result : text;
          })()}
        </p>
      </div>

      <footer className={styles.footer}>
        <p>{t_display("payments.footer")}</p>
      </footer>
    </div>
  );
}

