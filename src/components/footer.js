import Link from "next/link";
import Image from "next/image";
import styles from "./footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.logoSection}>
        <Image
          src="/blessedhouse_logo25.png"
          alt="Blessed House Logo"
          width={150}
          height={150}
          className={styles.logo}
        />
        <p className={styles.location}>Puerto Viejo - Costa Rica</p>
      </div>

      <div className={styles.container}>
        <div className={styles.section}>
          <h3>Blessed House</h3>
          <p>Southern Caribbean Living: Close to the Coast, Close to Everything.</p>
        </div>

        <div className={styles.section}>
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/gallery">Gallery</Link>
            </li>
            <li>
              <Link href="/villas">Villas</Link>
            </li>
            <li>
              <Link href="/activities">Activities</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div className={styles.section}>
          <h4>Contact Info</h4>
          <p>Email: info@blessedhouse.info</p>
          <p>Phone: +506 2750-0000</p>
          <p>Puerto Viejo, Limón, Costa Rica</p>
        </div>

        <div className={styles.section}>
          <h4>Social Media</h4>
          <div className={styles.socialRow}>
            <a href="#" aria-label="Instagram" className={styles.socialIcon}>
              <Image
                src="/social/instagram.png"
                alt="Instagram"
                width={50}
                height={50}
              />
            </a>
            <a href="#" aria-label="Facebook" className={styles.socialIcon}>
              <Image
                src="/social/facebook.png"
                alt="Facebook"
                width={50}
                height={50}
              />
            </a>
            <a href="#" aria-label="Airbnb" className={styles.socialIcon}>
              <Image
                src="/social/airbnb.png"
                alt="Airbnb"
                width={50}
                height={50}
              />
            </a>
            <a href="#" aria-label="YouTube" className={styles.socialIcon}>
              <Image
                src="/social/youtube.png"
                alt="YouTube"
                width={50}
                height={50}
              />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.copyright}>
        <p>&copy; {currentYear} Blessed House Resort. All rights reserved.</p>
      </div>
    </footer>
  );
}
