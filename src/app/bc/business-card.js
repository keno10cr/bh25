"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { resolveCopy } from "@/lib/cms-field";
import { FOOTER_SETTINGS_DEFAULTS } from "@/data/page-defaults";
import { BUSINESS_CARD_I18N } from "@/data/business-card-i18n";
import { SOCIAL_ICONS } from "@/components/footer";
import styles from "./business-card.module.css";

const SITE_URL = "https://www.blessedhouse.info";
const SITE_LABEL = "www.blessedhouse.info";
const DIRECTIONS_URL =
  "https://www.google.com/maps/search/?api=1&query=9.64735,-82.77697";

const ICON_PATHS = {
  phone:
    "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z",
  whatsapp:
    "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3 .78.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.25-.12-1.47-.72-1.7-.8s-.39-.12-.56.12-.64.8-.78.97-.29.18-.54.06a6.7 6.7 0 0 1-3.34-2.92c-.25-.43.25-.4.72-1.34a.45.45 0 0 0-.02-.43c-.06-.12-.56-1.34-.76-1.84s-.4-.41-.56-.42h-.48a.92.92 0 0 0-.66.31 2.8 2.8 0 0 0-.87 2.07 4.85 4.85 0 0 0 1 2.58 11.1 11.1 0 0 0 4.26 3.76c1.58.68 2.2.74 3 .62a2.55 2.55 0 0 0 1.68-1.18 2.1 2.1 0 0 0 .14-1.18c-.06-.1-.23-.16-.48-.28z",
  mail: "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 2v.4l8 5 8-5V7H4zm16 2.75-7.47 4.67a1 1 0 0 1-1.06 0L4 9.75V17h16V9.75z",
  globe:
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-2.95a15.6 15.6 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.9 8zM12 4.04A13.9 13.9 0 0 1 13.91 8h-3.82A13.9 13.9 0 0 1 12 4.04zM4.26 14a8.2 8.2 0 0 1 0-4h3.38a16.5 16.5 0 0 0 0 4H4.26zm.84 2h2.95a15.6 15.6 0 0 0 1.38 3.56A8 8 0 0 1 5.1 16zm2.95-8H5.1a8 8 0 0 1 4.33-3.56A15.6 15.6 0 0 0 8.05 8zM12 19.96A13.9 13.9 0 0 1 10.09 16h3.82A13.9 13.9 0 0 1 12 19.96zM14.34 14H9.66a14.7 14.7 0 0 1 0-4h4.68a14.7 14.7 0 0 1 0 4zm.23 5.56A15.6 15.6 0 0 0 15.95 16h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14a16.5 16.5 0 0 0 0-4h3.38a8.2 8.2 0 0 1 0 4h-3.38z",
  pin: "M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z",
  save: "M15 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zM6 10V7H4v3H1v2h3v3h2v-3h3v-2H6z",
  share:
    "M18 16.1a2.9 2.9 0 0 0-1.96.77l-7.13-4.15a3.2 3.2 0 0 0 0-1.44l7.05-4.11A3 3 0 1 0 15 5a3.2 3.2 0 0 0 .09.72L8.04 9.83a3 3 0 1 0 0 4.34l7.12 4.16a2.8 2.8 0 0 0-.08.67A2.92 2.92 0 1 0 18 16.1z",
};

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d={ICON_PATHS[name]} />
    </svg>
  );
}

function buildVCard({ brandName, phones, email, addressLine }) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${brandName} Villas`,
    `ORG:${brandName}`,
    ...phones.map((phone) => `TEL;TYPE=CELL:${phone.tel}`),
    email ? `EMAIL;TYPE=INTERNET:${email}` : "",
    `URL:${SITE_URL}`,
    addressLine ? `ADR;TYPE=WORK:;;${addressLine.replace(/,/g, "\\,")};;;;` : "",
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\r\n");
}

export default function BusinessCard({ footer }) {
  const { language, changeLanguage, languages } = useLanguage();
  const t = useTranslation(language);
  const copy = BUSINESS_CARD_I18N[language] || BUSINESS_CARD_I18N.en;
  const [shareStatus, setShareStatus] = useState("");

  const brandName = footer?.brandName?.value || FOOTER_SETTINGS_DEFAULTS.brandName;
  const locationLine = resolveCopy(footer?.locationLine, t("footer.location"), language);
  const email = footer?.email?.value || FOOTER_SETTINGS_DEFAULTS.email;
  const addressLine = footer?.addressLine?.value || FOOTER_SETTINGS_DEFAULTS.addressLine;
  const phones =
    Array.isArray(footer?.phones) && footer.phones.length > 0
      ? footer.phones
      : FOOTER_SETTINGS_DEFAULTS.phones;
  const socialLinks =
    Array.isArray(footer?.socialLinks) && footer.socialLinks.length > 0
      ? footer.socialLinks
      : FOOTER_SETTINGS_DEFAULTS.socialLinks;

  useEffect(() => {
    const lang = new URLSearchParams(window.location.search).get("lang");
    if (lang && languages[lang]) changeLanguage(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveContact = () => {
    const vcard = buildVCard({ brandName, phones, email, addressLine });
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "blessed-house.vcf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${brandName} Villas`, text: copy.tagline.replace(/\n/g, " "), url });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus(copy.copied);
      setTimeout(() => setShareStatus(""), 2500);
    } catch {
      setShareStatus("");
    }
  };

  const reveal = (step) => ({
    className: styles.reveal,
    style: { "--d": step },
  });
  const socialStart = 13;
  const afterSocial = socialStart + socialLinks.length * 0.5 + 0.5;

  return (
    <main className={styles.page}>
      <div
        className={`${styles.langRow} ${styles.reveal}`}
        style={{ "--d": 0 }}
        role="group"
        aria-label={copy.language}
      >
        {Object.values(languages).map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`${styles.langBtn} ${language === lang.code ? styles.langBtnActive : ""}`}
            onClick={() => changeLanguage(lang.code)}
            aria-pressed={language === lang.code}
            title={lang.nativeName}
          >
            <Image src={lang.flag} alt={lang.nativeName} width={22} height={22} />
          </button>
        ))}
      </div>

      <article className={styles.card}>
        <header className={styles.hero}>
          <div className={styles.heroMedia}>
            <Image
              src="/BannerVilla4.jpg"
              alt=""
              fill
              priority
              sizes="440px"
              className={styles.heroImage}
            />
          </div>
          <div className={styles.logoWrap}>
            <Image
              src="/logoSM.jpg"
              alt={`${brandName} logo`}
              width={112}
              height={112}
              priority
              className={styles.logo}
            />
          </div>
        </header>

        <div className={styles.body}>
          <h1 className={`${styles.brand} ${styles.reveal}`} style={{ "--d": 3 }}>
            {brandName}
          </h1>
          <p className={`${styles.location} ${styles.reveal}`} style={{ "--d": 4 }}>
            {locationLine.value}
          </p>
          <p className={`${styles.tagline} ${styles.reveal}`} style={{ "--d": 5 }}>
            {copy.tagline}
          </p>

          <div className={styles.quickActions}>
            <a
              href={`tel:${phones[0]?.tel}`}
              className={`${styles.quickAction} ${styles.reveal}`}
              style={{ "--d": 6 }}
            >
              <Icon name="phone" />
              <span>{copy.call}</span>
            </a>
            <a
              href={`https://wa.me/${String(phones[0]?.tel || "").replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.quickAction} ${styles.reveal}`}
              style={{ "--d": 6.5 }}
            >
              <Icon name="whatsapp" />
              <span>{copy.whatsapp}</span>
            </a>
            <a
              href={`mailto:${email}`}
              className={`${styles.quickAction} ${styles.reveal}`}
              style={{ "--d": 7 }}
            >
              <Icon name="mail" />
              <span>{copy.email}</span>
            </a>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.quickAction} ${styles.reveal}`}
              style={{ "--d": 7.5 }}
            >
              <Icon name="pin" />
              <span>{copy.directions}</span>
            </a>
          </div>

          <section className={styles.block}>
            <h2 className={`${styles.blockTitle} ${styles.reveal}`} style={{ "--d": 8.5 }}>
              {copy.phones}
            </h2>
            <ul className={styles.list}>
              {phones.map((phone, index) => (
                <li
                  key={phone.tel}
                  className={`${styles.phoneRow} ${styles.reveal}`}
                  style={{ "--d": 9 + index * 0.5 }}
                >
                  <a href={`tel:${phone.tel}`} className={styles.phoneLink}>
                    <Icon name="phone" />
                    <span dir="ltr">{phone.label}</span>
                  </a>
                  <a
                    href={`https://wa.me/${String(phone.tel).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.waBtn}
                    aria-label={`${copy.whatsapp} ${phone.label}`}
                  >
                    <Icon name="whatsapp" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.block}>
            <ul className={styles.list}>
              <li {...reveal(11)}>
                <a href={`mailto:${email}`} className={styles.infoRow}>
                  <Icon name="mail" />
                  <span>{email}</span>
                </a>
              </li>
              <li {...reveal(11.5)}>
                <a href={SITE_URL} className={styles.infoRow}>
                  <Icon name="globe" />
                  <span>{SITE_LABEL}</span>
                </a>
              </li>
              <li {...reveal(12)}>
                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.infoRow}
                >
                  <Icon name="pin" />
                  <span>{addressLine}</span>
                </a>
              </li>
            </ul>
          </section>

          {socialLinks.length > 0 ? (
            <section className={styles.block}>
              <h2
                className={`${styles.blockTitle} ${styles.reveal}`}
                style={{ "--d": socialStart - 0.5 }}
              >
                {copy.follow}
              </h2>
              <div className={styles.socialRow}>
                {socialLinks.map((link, index) => {
                  const icon = SOCIAL_ICONS[link.network] || link.iconUrl;
                  if (!icon) return null;
                  return (
                    <a
                      key={link.key || link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className={`${styles.socialIcon} ${styles.reveal}`}
                      style={{ "--d": socialStart + index * 0.5 }}
                    >
                      <Image src={icon} alt={link.iconAlt || link.label || ""} width={44} height={44} />
                    </a>
                  );
                })}
              </div>
            </section>
          ) : null}

          <div
            className={`${styles.ctaRow} ${styles.reveal}`}
            style={{ "--d": afterSocial }}
          >
            <Link href="/villas" className={styles.ctaPrimary}>
              {copy.bookStay}
            </Link>
            <Link href="/pvg" className={styles.ctaSecondary}>
              {copy.bookGroups}
            </Link>
          </div>

          <div
            className={`${styles.utilityRow} ${styles.reveal}`}
            style={{ "--d": afterSocial + 1 }}
          >
            <button type="button" className={styles.utilityBtn} onClick={handleSaveContact}>
              <Icon name="save" />
              <span>{copy.saveContact}</span>
            </button>
            <button type="button" className={styles.utilityBtn} onClick={handleShare}>
              <Icon name="share" />
              <span>{shareStatus || copy.share}</span>
            </button>
          </div>
        </div>
      </article>
    </main>
  );
}
