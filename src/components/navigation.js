"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import styles from "./navigation.module.css";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage) {
        setIsScrolled(window.scrollY > 100);
      } else {
        setIsScrolled(true);
      }
    };

    if (isHomePage) {
      window.addEventListener("scroll", handleScroll);
      handleScroll(); // Check initial state
    } else {
      setIsScrolled(true);
    }

    return () => {
      if (isHomePage) {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isHomePage]);

  const showLargeLogo = isHomePage && !isScrolled;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoLink}>
          {showLargeLogo ? (
            <div className={styles.largeLogo}>
              <Image
                src="/blessedhouse_logo25.png"
                alt="Blessed House Logo"
                width={80}
                height={80}
                className={styles.logoImage}
                priority
              />
              <span className={styles.logoText}>Blessed House</span>
            </div>
          ) : (
            <div className={styles.smallLogo}>
              <Image
                src="/blessedhouse_logo25.png"
                alt="Blessed House Logo"
                width={40}
                height={40}
                className={styles.logoImage}
              />
              <span className={styles.logoText}>Blessed House</span>
            </div>
          )}
        </Link>

        <button
          className={styles.hamburger}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`${styles.navLinks} ${isOpen ? styles.active : ""}`}>
          <li>
            <Link href="/" onClick={() => setIsOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/gallery" onClick={() => setIsOpen(false)}>
              Gallery
            </Link>
          </li>
          <li>
            <Link href="/villas" onClick={() => setIsOpen(false)}>
              Villas
            </Link>
          </li>
          <li>
            <Link href="/activities" onClick={() => setIsOpen(false)}>
              Activities
            </Link>
          </li>
          <li>
            <Link href="/contact" onClick={() => setIsOpen(false)}>
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
