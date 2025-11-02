import Link from "next/link";
import styles from "./hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.title}>Blessed House Awaits</h1>
        <p className={styles.subtitle}>
          Luxury bungalows and villas nestled in the heart of Puerto Viejo
        </p>
        <div className={styles.cta}>
          <Link href="/villas" className={styles.btnPrimary}>
            Explore Villas
          </Link>
          <Link href="/contact" className={styles.btnSecondary}>
            Get in Touch
          </Link>
        </div>
      </div>
      <div className={styles.heroImage}>
        <img
          src="/tropical-beach-bungalow-resort.jpg"
          alt="Tropical bungalow with ocean view"
        />
      </div>
    </section>
  );
}

