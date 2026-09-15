"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./language-switcher";
import LanguageSwitcherPayments from "./language-switcher-payments";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { NAV_SETTINGS_DEFAULTS } from "@/data/page-defaults";
import styles from "./navigation.module.css";

const NAV_KEY_BY_HREF = {
  "/gallery": "gallery",
  "/villas": "villas",
  "/activities": "activities",
  "/blog": "blog",
  "/contact": "contact",
};

function linkLabel(link, t, language) {
  const key = NAV_KEY_BY_HREF[link.href];
  if (key && language !== "en") return t(`nav.${key}`);
  return link.label || (key ? t(`nav.${key}`) : link.href);
}

function isActivePath(pathname, href) {
  if (!pathname || !href) return false;
  if (href === "/") return pathname === "/";
  if (href === "/blog") return pathname.startsWith("/blog");
  return pathname === href;
}

export default function Navigation({ nav }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const pathname = usePathname();
  const isPaymentsPage =
    pathname === "/payments" ||
    pathname === "/p" ||
    pathname === "/payment" ||
    pathname === "/pagos";
  const isPvgPage = pathname === "/pvg";
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const menuOpenRef = useRef(false);

  const brandName = nav?.brandName?.value || NAV_SETTINGS_DEFAULTS.brandName;
  const links =
    Array.isArray(nav?.links) && nav.links.length > 0
      ? nav.links
      : NAV_SETTINGS_DEFAULTS.links;

  menuOpenRef.current = isOpen || isClosing;

  useEffect(() => {
    if (!isPvgPage) {
      setNavHidden(false);
      return undefined;
    }

    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;

      if (menuOpenRef.current) {
        setNavHidden(false);
      } else if (currentY < 24) {
        setNavHidden(false);
      } else if (delta > 6) {
        setNavHidden(true);
      } else if (delta < -6) {
        setNavHidden(false);
      }

      lastY = currentY;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isPvgPage]);

  const handleToggle = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 400);
    } else {
      setIsOpen(true);
      setIsClosing(false);
      setNavHidden(false);
    }
  };

  const handleLinkClick = () => {
    handleToggle();
  };

  return (
    <nav
      className={`${styles.navbar} ${
        isPvgPage && navHidden ? styles.navbarHidden : ""
      } ${isPvgPage ? styles.navbarAutoHide : ""}`}
    >
      <div className={styles.container}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logo}>
            <Image
              src="/blessedhouse_logo25.png"
              alt={`${brandName} Logo`}
              width={80}
              height={80}
              className={styles.logoImage}
              priority
            />
            <span className={styles.logoText}>{brandName}</span>
          </div>
        </Link>

        <ul
          className={`${styles.navLinks} ${
            isOpen && !isClosing
              ? styles.active
              : isClosing
                ? styles.closing
                : ""
          }`}
        >
          {links.map((link) => (
            <li key={link.key || link.href}>
              <Link
                href={link.href}
                onClick={handleLinkClick}
                className={
                  isActivePath(pathname, link.href) ? styles.active : ""
                }
              >
                {linkLabel(link, t, language)}
              </Link>
            </li>
          ))}
          {isPaymentsPage && (language === "en" || language === "es") && (
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
          {isPaymentsPage ? (
            <LanguageSwitcherPayments />
          ) : (
            <LanguageSwitcher />
          )}
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
