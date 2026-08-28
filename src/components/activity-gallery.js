import styles from "./activity-gallery.module.css";

export default function ActivityGallery({ images = [], activityName = "Activity" }) {
  if (!images.length) return null;

  return (
    <section
      className={styles.gallery}
      aria-label={`${activityName} photo gallery`}
    >
      <div className={styles.grid}>
        {images.map((image, index) => (
          <figure key={image.url || index} className={styles.item}>
            <img
              src={image.url}
              alt={image.alt || `${activityName} photo ${index + 1}`}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
