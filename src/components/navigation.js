"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./language-switcher";
import LanguageSwitcherPayments from "./language-switcher-payments";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./navigation.module.css";

export default function Navigation() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const pathname = usePathname();
  const isPaymentsPage = pathname === "/payments";
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleToggle = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 400); // Match the close animation duration
    } else {
      setIsOpen(true);
      setIsClosing(false);
    }
  };

  const handleLinkClick = () => {
    handleToggle();
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logo}>
            <Image
              src="/favicon.png"
              alt="Blessed House Logo"
              width={80}
              height={80}
              className={styles.logoImage}
              priority
            />
            <span className={styles.logoText}>Blessed House</span>
          </div>
        </Link>

        <ul className={`${styles.navLinks} ${isOpen && !isClosing ? styles.active : isClosing ? styles.closing : ""}`}>
          <li>
            <Link 
              href="/gallery" 
              onClick={handleLinkClick}
              className={pathname === "/gallery" ? styles.active : ""}
            >
              {t("nav.gallery")}
            </Link>
          </li>
          <li>
            <Link 
              href="/villas" 
              onClick={handleLinkClick}
              className={pathname === "/villas" ? styles.active : ""}
            >
              {t("nav.villas")}
            </Link>
          </li>
          <li>
            <Link 
              href="/activities" 
              onClick={handleLinkClick}
              className={pathname === "/activities" ? styles.active : ""}
            >
              {t("nav.activities")}
            </Link>
          </li>
          <li>
            <Link 
              href="/contact" 
              onClick={handleLinkClick}
              className={pathname === "/contact" ? styles.active : ""}
            >
              {t("nav.contact")}
            </Link>
          </li>
          {pathname === "/payments" && (language === "en" || language === "es") && (
            <li>
              <Link 
                href="/payments" 
                onClick={handleLinkClick}
                className={styles.active}
              >
                {language === "en" ? "Payments" : "Pagos"}
              </Link>
            </li>
          )}
        </ul>

        <div className={styles.rightSection}>
          {isPaymentsPage ? <LanguageSwitcherPayments /> : <LanguageSwitcher />}
          <button
            className={`${styles.hamburger} ${isOpen ? styles.active : ""}`}
            onClick={handleToggle}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
