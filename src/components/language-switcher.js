"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage, languages } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./language-switcher.module.css";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const t = useTranslation(language);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef(null);
  const buttonRef = useRef(null);

  const currentLanguage = languages[language];

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

  return (
    <>
      <button
        ref={buttonRef}
        className={styles.languageButton}
        onClick={handleToggle}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className={styles.flag}>{currentLanguage.flag}</span>
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
              <h3>{language === "ja" ? "言語を選択" : language === "es" ? "Seleccionar Idioma" : language === "de" ? "Sprache Auswählen" : language === "nl" ? "Taal Selecteren" : language === "fr" ? "Sélectionner la Langue" : "Select Language"}</h3>
              <button
                className={styles.closeButton}
                onClick={handleToggle}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className={styles.languageList}>
              {Object.values(languages).map((lang) => (
                <button
                  key={lang.code}
                  className={`${styles.languageOption} ${
                    language === lang.code ? styles.active : ""
                  }`}
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  <span className={styles.flag}>{lang.flag}</span>
                  <div className={styles.languageInfo}>
                    <span className={styles.languageName}>{lang.nativeName}</span>
                    <span className={styles.languageEnglish}>{lang.name}</span>
                  </div>
                  {language === lang.code && (
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

