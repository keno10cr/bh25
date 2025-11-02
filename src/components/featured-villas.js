import Link from "next/link";
import styles from "./featured-villas.module.css";

const villas = [
  {
    id: 1,
    name: "Ocean Breeze Villa",
    description: "Beachfront luxury with direct ocean access",
    image: "/luxury-beachfront-villa-tropical.jpg",
    price: "$350/night",
  },
  {
    id: 2,
    name: "Jungle Retreat",
    description: "Secluded bungalow surrounded by lush greenery",
    image: "/jungle-bungalow-surrounded-by-trees.jpg",
    price: "$250/night",
  },
  {
    id: 3,
    name: "Sunset View Bungalow",
    description: "Perfect vantage point for Caribbean sunsets",
    image: "/tropical-bungalow-sunset-view.jpg",
    price: "$300/night",
  },
];

export default function FeaturedVillas() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Featured Villas</h2>
          <p>Experience luxury in our handpicked selection of bungalows</p>
        </div>

        <div className={styles.grid}>
          {villas.map((villa) => (
            <div key={villa.id} className={styles.card}>
              <div className={styles.image}>
                <img src={villa.image || "/placeholder.svg"} alt={villa.name} />
              </div>
              <div className={styles.content}>
                <h3>{villa.name}</h3>
                <p>{villa.description}</p>
                <div className={styles.footer}>
                  <span className={styles.price}>{villa.price}</span>
                  <Link href={`/villas#${villa.id}`} className={styles.link}>
                    Learn More →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.viewAll}>
          <Link href="/villas" className={styles.btnLink}>
            View All Villas
          </Link>
        </div>
      </div>
    </section>
  );
}

