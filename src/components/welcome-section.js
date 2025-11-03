import Image from "next/image";
import styles from "./welcome-section.module.css";

export default function WelcomeSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Welcome to the<br/>Southern Caribbean Paradise</h2>
          <div className={styles.logoContainer}>
            <Image
              src="/blessedhouse_logo25.png"
              alt="Blessed House Logo"
              width={150}
              height={150}
              className={styles.logo}
            />
          </div>
          <p>
            Blessed House is the right choice for visitors who are searching for a combination of charm, peace and quiet. Also we are in a convenient position to explore Puerto Viejo and the beautiful places around.
          </p>
          <div className={styles.videoContainer}>
            <div className={styles.videoWrapper}>
              <iframe
                src="https://www.youtube.com/embed/nwga2GnnoMM?rel=0&modestbranding=1"
                title="Welcome to Blessed House"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className={styles.video}
              ></iframe>
            </div>
            <p className={styles.videoCredit}>
              Video by{" "}
              <a
                href="https://www.instagram.com/dazelg/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.videoLink}
              >
                dazelg
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
