import Link from "next/link";
import styles from "./footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <h3>Blessed House</h3>
          <p>Luxury bungalows and villas in the heart of Puerto Viejo, Limón.</p>
          <div className={styles.social}>
            <a href="#" aria-label="Instagram">
              Instagram
            </a>
            <a href="#" aria-label="Facebook">
              Facebook
            </a>
            <a href="#" aria-label="Twitter">
              Twitter
            </a>
          </div>
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
          <p>Email: info@blessedhouse.com</p>
          <p>Phone: +506 2750-0000</p>
          <p>Puerto Viejo, Limón, Costa Rica</p>
        </div>

        <div className={styles.section}>
          <h4>Newsletter</h4>
          <p>Subscribe for updates and special offers</p>
          <form className={styles.emailForm}>
            <input type="email" placeholder="Your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className={styles.copyright}>
        <p>&copy; {currentYear} Blessed House Resort. All rights reserved.</p>
      </div>
    </footer>
  );
}

