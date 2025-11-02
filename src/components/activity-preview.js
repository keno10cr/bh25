import Link from "next/link";
import styles from "./activity-preview.module.css";

const activities = [
  {
    id: 1,
    name: "Snorkeling",
    description: "Explore vibrant coral reefs and tropical fish",
    icon: "🤿",
  },
  {
    id: 2,
    name: "Jungle Hike",
    description: "Trek through pristine rainforest trails",
    icon: "🥾",
  },
  {
    id: 3,
    name: "Boat Tour",
    description: "Cruise along the Caribbean coastline",
    icon: "⛵",
  },
  {
    id: 4,
    name: "Wildlife Watching",
    description: "Spot sloths, monkeys, and exotic birds",
    icon: "🦥",
  },
];

export default function ActivityPreview() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Things to Do</h2>
          <p>Unforgettable experiences in paradise</p>
        </div>

        <div className={styles.grid}>
          {activities.map((activity) => (
            <div key={activity.id} className={styles.activityCard}>
              <div className={styles.icon}>{activity.icon}</div>
              <h3>{activity.name}</h3>
              <p>{activity.description}</p>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <Link href="/activities" className={styles.btn}>
            Explore All Activities
          </Link>
        </div>
      </div>
    </section>
  );
}

