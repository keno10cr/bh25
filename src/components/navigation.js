"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import styles from "./navigation.module.css";

export default function Navigation() {
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

        <button
          className={`${styles.hamburger} ${isOpen ? styles.active : ""}`}
          onClick={handleToggle}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`${styles.navLinks} ${isOpen && !isClosing ? styles.active : isClosing ? styles.closing : ""}`}>
          <li>
            <Link href="/gallery" onClick={handleLinkClick}>
              Gallery
            </Link>
          </li>
          <li>
            <Link href="/villas" onClick={handleLinkClick}>
              Villas
            </Link>
          </li>
          <li>
            <Link href="/activities" onClick={handleLinkClick}>
              Activities
            </Link>
          </li>
          <li>
            <Link href="/contact" onClick={handleLinkClick}>
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
