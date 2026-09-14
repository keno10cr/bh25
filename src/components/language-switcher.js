"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useLanguage, languages } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./language-switcher.module.css";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const t = useTranslation(language);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef(null);
  const buttonRef = useRef(null);

  const currentLanguage = languages[language];

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const modal =
    mounted && isOpen
      ? createPortal(
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
                {Object.values(languages).map((lang) => (
                  <button
                    key={lang.code}
                    className={`${styles.languageOption} ${
                      language === lang.code ? styles.active : ""
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
                      <span className={styles.languageName}>
                        {lang.nativeName}
                      </span>
                      <span className={styles.languageEnglish}>{lang.name}</span>
                    </div>
                    {language === lang.code && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

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
      {modal}
    </>
  );
}
