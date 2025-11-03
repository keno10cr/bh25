"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./activity-detail.module.css";

export default function ActivityDetail({ activity }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLearnMore = () => {
    setIsExpanded(true);
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={activity.image || "/placeholder.svg"} alt={activity.name} />
        {activity.difficulty && (
          <span
            className={styles.difficulty}
            data-level={activity.difficulty.toLowerCase()}
          >
            {activity.difficulty}
          </span>
        )}
      </div>

      <div className={styles.content}>
        <h3>{activity.name}</h3>
        <p className={styles.description}>{activity.description}</p>

        {activity.duration || activity.price || activity.groupSize ? (
          <div className={styles.info}>
            {activity.duration && (
              <div className={styles.infoItem}>
                <span className={styles.label}>Duration</span>
                <span className={styles.value}>{activity.duration}</span>
              </div>
            )}
            {activity.groupSize && (
              <div className={styles.infoItem}>
                <span className={styles.label}>Group Size</span>
                <span className={styles.value}>{activity.groupSize}</span>
              </div>
            )}
            {activity.price && (
              <div className={styles.infoItem}>
                <span className={styles.label}>Price</span>
                <span className={styles.value}>{activity.price}</span>
              </div>
            )}
          </div>
        ) : null}

        {isExpanded && (
          <>
            {activity.fullDescription && (
              <div className={styles.fullDesc}>
                <p>{activity.fullDescription}</p>
              </div>
            )}

            {activity.highlights && activity.highlights.length > 0 && (
              <div className={styles.highlights}>
                <h4>What's Included</h4>
                <ul>
                  {activity.highlights.map((item, idx) => (
                    <li key={idx}>
                      <span className={styles.checkmark}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activity.externalLink ? (
              <a
                href={activity.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                Visit Website
              </a>
            ) : (
              <Link
                href="/contact?subject=activities"
                className={styles.contactLink}
              >
                Contact Us About This Activity
              </Link>
            )}

            <button className={styles.showLessBtn} onClick={() => setIsExpanded(false)}>
              Show Less
            </button>
          </>
        )}

        {!isExpanded && (
          <button className={styles.learnMoreBtn} onClick={handleLearnMore}>
            Read More
          </button>
        )}
      </div>
    </div>
  );
}
