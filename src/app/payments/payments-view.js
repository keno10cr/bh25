"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { languages, useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./payments.module.css";

const STORAGE_KEY = "blessedhouse-language";
const SUPPORTED = ["en", "es"];

const BANKS = [
  {
    key: "bankBAC",
    logo: "/images/BAC-logoWeb.png",
    rows: ["nombre", "cedulaJuridica", "sinpe", "ibanColones", "ibanDolares", "swift"],
  },
  {
    key: "bankNacional",
    logo: "/images/bn-logoWeb.png",
    rows: ["nombre", "cedulaFisica", "sinpe", "ibanColones", "ibanDolares"],
  },
  {
    key: "bankBCR",
    logo: "/images/bcr-logoWeb.png",
    rows: ["nombre", "cedulaFisica", "ibanColones", "ibanDolares"],
  },
];

export function paymentsPathFor(language) {
  return language === "es" ? "/pagos" : "/payments";
}

function resolveInitialLanguage(forceLanguage) {
  if (forceLanguage) return forceLanguage;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && languages[saved]) return saved;
  const browser = (navigator.language || "").split("-")[0];
  return languages[browser] ? browser : "en";
}

/** Account numbers are pasted into banking apps, which expect no spaces. */
const COPY_WITHOUT_SPACES = new Set(["sinpe", "ibanColones", "ibanDolares", "swift"]);

function highlightContacts(text) {
  const pattern = /\+\d{1,3}\s?(?:\(\d{3}\)\s?\d{3}[\s.]?\d{4}|\d{4}\s?\d{4})/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <a
        key={match.index}
        href={`https://wa.me/${match[0].replace(/\D/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappLink}
      >
        {match[0]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

async function copyToClipboard(value) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CopiedModal({ copied, t, onClose }) {
  const okRef = useRef(null);

  useEffect(() => {
    okRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape" || event.key === "Enter") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="copied-title"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          src="/blessedhouse_logo25.png"
          alt="Blessed House Logo"
          width={72}
          height={72}
          className={styles.modalLogo}
        />
        <h2 id="copied-title" className={styles.modalTitle}>
          {t("payments.copy.title")}
        </h2>
        <p className={styles.modalMessage}>
          {t("payments.copy.message").replace("{label}", copied.label)}
        </p>
        <p className={styles.modalValue}>{copied.value}</p>
        <button ref={okRef} type="button" className={styles.modalButton} onClick={onClose}>
          {t("payments.copy.ok")}
        </button>
      </div>
    </div>
  );
}

/**
 * forceLanguage: set by /pagos and /p (es) or /payment (en).
 * The URL always follows the active language: /pagos for Spanish, /payments otherwise.
 */
export default function PaymentsView({ forceLanguage }) {
  const { language, changeLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const expectedLanguage = useRef(null);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    expectedLanguage.current = resolveInitialLanguage(forceLanguage);
    if (forceLanguage) {
      window.localStorage.setItem(STORAGE_KEY, forceLanguage);
      changeLanguage(forceLanguage);
    }
    // changeLanguage is recreated on every provider render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceLanguage]);

  useEffect(() => {
    const expected = expectedLanguage.current;
    if (!expected) return;
    // The provider starts on "en" and applies the saved language a moment later.
    if (!settled && language !== expected) return;
    if (!settled) setSettled(true);

    if (!SUPPORTED.includes(language)) {
      changeLanguage("en");
      return;
    }
    const target = paymentsPathFor(language);
    if (pathname !== target) router.replace(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, pathname, settled]);

  const activeLanguage = !settled && forceLanguage ? forceLanguage : language;
  const displayLanguage = SUPPORTED.includes(activeLanguage) ? activeLanguage : "en";
  const t = useTranslation(displayLanguage);
  const [copied, setCopied] = useState(null);
  const closeCopied = useCallback(() => setCopied(null), []);

  async function handleCopy(label, value, row) {
    const clipboardValue = COPY_WITHOUT_SPACES.has(row) ? value.replace(/\s+/g, "") : value;
    try {
      await copyToClipboard(clipboardValue);
      setCopied({ label, value: clipboardValue });
    } catch (error) {
      console.error(error);
    }
  }

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
        <h1>{t("payments.title")}</h1>
      </div>

      <div className={styles.contactInfo}>
        <p className={styles.contactText}>
          {highlightContacts(t("payments.contactText"))}
        </p>
      </div>

      {BANKS.map((bank) => {
        const title = t(`payments.${bank.key}.title`);
        return (
          <section key={bank.key} className={styles.bankSection}>
            <div className={styles.bankHeader}>
              <Image
                src={bank.logo}
                alt={title}
                width={967}
                height={330}
                className={styles.bankLogo}
              />
              <h2 className={styles.bankName}>{title}</h2>
            </div>
            <table className={styles.accountTable}>
              <tbody>
                {bank.rows.map((row) => {
                  const label = t(`payments.labels.${row}`);
                  const value = t(`payments.${bank.key}.${row}`);
                  return (
                    <tr key={row}>
                      <td>{label}</td>
                      <td>
                        <div className={styles.valueCell}>
                          <span className={styles.value}>{value}</span>
                          {row === "sinpe" ? (
                            <Image
                              src="/info/PagosTiempoRealSinpeMovilbccr.gif"
                              alt="SINPE Móvil"
                              width={99}
                              height={99}
                              className={styles.sinpeBadge}
                              unoptimized
                            />
                          ) : null}
                          <button
                            type="button"
                            className={styles.copyButton}
                            onClick={() => handleCopy(label, value, row)}
                            aria-label={t("payments.copy.button").replace("{label}", label)}
                            title={t("payments.copy.button").replace("{label}", label)}
                          >
                            <CopyIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        );
      })}

      <footer className={styles.footer}>
        <p>{t("payments.footer")}</p>
      </footer>

      {copied ? <CopiedModal copied={copied} t={t} onClose={closeCopied} /> : null}
    </div>
  );
}
