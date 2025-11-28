"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./language-switcher.module.css";

const paymentsLanguages = {
  en: {
    code: "en",
    name: "English",
    flag: "/info/flag-usa-sm.png",
    nativeName: "English",
  },
  es: {
    code: "es",
    name: "Español",
    flag: "/info/flag-tico-sm.png",
    nativeName: "Español",
  },
};

export default function LanguageSwitcherPayments() {
  const { language, changeLanguage } = useLanguage();
  const t = useTranslation(language);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef(null);
  const buttonRef = useRef(null);

  // Only use English or Spanish, default to English if other language is selected
  const currentLangCode = language === "en" || language === "es" ? language : "en";
  const currentLanguage = paymentsLanguages[currentLangCode];

  const handleToggle = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 300);
    } else {
      setIsOpen(true);
      setIsClosing(false);
    }
  };

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsClosing(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsClosing(false);
        }, 300);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsClosing(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsClosing(false);
        }, 300);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // If language is not English or Spanish, switch to English
  useEffect(() => {
    if (language !== "en" && language !== "es") {
      changeLanguage("en");
    }
  }, [language, changeLanguage]);

  return (
    <>
      <button
        ref={buttonRef}
        className={styles.languageButton}
        onClick={handleToggle}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Image
          src={currentLanguage.flag}
          alt={currentLanguage.name}
          width={29}
          height={29}
          className={styles.flag}
        />
      </button>

      {isOpen && (
        <div
          className={`${styles.modalOverlay} ${
            isClosing ? styles.closing : ""
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsClosing(true);
              setTimeout(() => {
                setIsOpen(false);
                setIsClosing(false);
              }, 300);
            }
          }}
        >
          <div
            ref={modalRef}
            className={`${styles.modal} ${isClosing ? styles.closing : ""}`}
          >
            <div className={styles.modalHeader}>
              <h3>{t("common.selectLanguage")}</h3>
              <button
                className={styles.closeButton}
                onClick={handleToggle}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className={styles.languageList}>
              {Object.values(paymentsLanguages).map((lang) => (
                <button
                  key={lang.code}
                  className={`${styles.languageOption} ${
                    currentLangCode === lang.code ? styles.active : ""
                  }`}
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  <Image
                    src={lang.flag}
                    alt={lang.name}
                    width={38}
                    height={38}
                    className={styles.flag}
                  />
                  <div className={styles.languageInfo}>
                    <span className={styles.languageName}>{lang.nativeName}</span>
                    <span className={styles.languageEnglish}>{lang.name}</span>
                  </div>
                  {currentLangCode === lang.code && (
                    <span className={styles.checkmark}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

