"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import styles from "./navigation.module.css";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logo}>
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
