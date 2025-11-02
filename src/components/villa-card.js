import Link from "next/link";
import styles from "./villa-card.module.css";

export default function VillaCard({ villa }) {
  return (
    <div className={styles.card} id={`${villa.id}`}>
      <div className={styles.imageContainer}>
        <img src={villa.image || "/placeholder.svg"} alt={villa.name} />
        <span className={styles.badge}>{villa.category}</span>
      </div>

      <div className={styles.content}>
        <h3>{villa.name}</h3>
        <p className={styles.description}>{villa.description}</p>

        <div className={styles.details}>
          <div className={styles.spec}>
            <span className={styles.label}>Bedrooms</span>
            <span className={styles.value}>{villa.bedrooms}</span>
          </div>
          <div className={styles.spec}>
            <span className={styles.label}>Bathrooms</span>
            <span className={styles.value}>{villa.bathrooms}</span>
          </div>
        </div>

        <div className={styles.features}>
          <h4>Amenities</h4>
          <div className={styles.featureList}>
            {villa.features.map((feature, idx) => (
              <span key={idx} className={styles.feature}>
                ✓ {feature}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.price}>
            <span className={styles.amount}>{villa.price}</span>
            <span className={styles.period}>/night</span>
          </div>
          <Link href="/contact" className={styles.btn}>
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}

