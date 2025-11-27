import Link from "next/link";
import styles from "./featured-villas.module.css";

const villas = [
  {
    id: 4,
    name: "Villa #4 Colibri",
    description: "Caribbean style villa with spacious outdoor areas",
    image: "/villas/4/4a.jpg",
  },
  {
    id: 9,
    name: "Villa #9 Mono Cariblanco",
    description: "Caribbean style villa perfect for families",
    image: "/villas/9/9a.jpg",
  },
  {
    id: 12,
    name: "Villa #12 Mariposa Morpho",
    description: "Caribbean style villa with beautiful gardens",
    image: "/villas/12/12a.jpg",
  },
];

export default function FeaturedVillas() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Featured Villas</h2>
          <p>Experience Caribbean style in our handpicked selection of villas</p>
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
                  <Link href={`/villas#villa-${villa.id}`} className={styles.link}>
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
