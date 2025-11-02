import styles from "./activity-detail.module.css"

interface Activity {
  id: number
  name: string
  description: string
  fullDescription: string
  duration: string
  price: string
  difficulty: string
  groupSize: string
  image: string
  highlights: string[]
}

interface ActivityDetailProps {
  activity: Activity
}

export default function ActivityDetail({ activity }: ActivityDetailProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={activity.image || "/placeholder.svg"} alt={activity.name} />
        <span className={styles.difficulty} data-level={activity.difficulty.toLowerCase()}>
          {activity.difficulty}
        </span>
      </div>

      <div className={styles.content}>
        <h3>{activity.name}</h3>
        <p className={styles.description}>{activity.description}</p>

        <div className={styles.fullDesc}>
          <p>{activity.fullDescription}</p>
        </div>

        <div className={styles.info}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Duration</span>
            <span className={styles.value}>{activity.duration}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Group Size</span>
            <span className={styles.value}>{activity.groupSize}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Price</span>
            <span className={styles.value}>{activity.price}</span>
          </div>
        </div>

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

        <button className={styles.bookBtn}>Book Activity</button>
      </div>
    </div>
  )
}
