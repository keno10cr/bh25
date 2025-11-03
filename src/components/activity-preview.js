"use client";

import { useState, useEffect, useRef } from "react";
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
    name: "Bribri Wonders",
    description: "Discover cacao traditions and local culture",
    icon: "🍫",
  },
  {
    id: 5,
    name: "Wildlife Watching",
    description: "Spot sloths, monkeys, and exotic birds",
    icon: "🦥",
  },
];

export default function ActivityPreview() {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, entry.target.dataset.id]));
          } else {
            setVisibleItems((prev) => {
              const next = new Set(prev);
              next.delete(entry.target.dataset.id);
              return next;
            });
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    const items = sectionRef.current?.querySelectorAll("[data-activity-item]");
    items?.forEach((item) => observer.observe(item));

    return () => {
      items?.forEach((item) => observer.unobserve(item));
    };
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Things to Do</h2>
          <p>Unforgettable experiences in paradise</p>
        </div>

        <div className={styles.grid}>
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              data-activity-item
              data-id={activity.id}
              className={`${styles.activityCard} ${
                visibleItems.has(String(activity.id)) ? styles.visible : ""
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
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
