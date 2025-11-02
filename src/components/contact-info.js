import styles from "./contact-info.module.css";

export default function ContactInfo() {
  return (
    <div className={styles.infoContainer}>
      <h2>Contact Information</h2>

      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <div className={styles.icon}>📍</div>
          <h3>Address</h3>
          <p>Puerto Viejo de Limón</p>
          <p>Limón Province, Costa Rica</p>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.icon}>📞</div>
          <h3>Phone</h3>
          <p>Main: +506 2750-0000</p>
          <p>Reservations: +506 2750-0001</p>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.icon}>✉️</div>
          <h3>Email</h3>
          <p>info@blessedhouse.com</p>
          <p>bookings@blessedhouse.com</p>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.icon}>⏰</div>
          <h3>Hours</h3>
          <p>Mon - Sun: 8:00 AM - 10:00 PM</p>
          <p>Available 24/7 for emergencies</p>
        </div>
      </div>

      <div className={styles.mapContainer}>
        <h3>Find Us Here</h3>
        <div className={styles.map}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3934.2707827394147!2d-75.73433432346913!3d10.342221167265438!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa083e4e5555555%3A0x8fa083e4e5555555!2sPuerto%20Viejo%20de%20Lim%C3%B3n!5e0!3m2!1sen!2scr!4v1234567890"
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: "12px" }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <div className={styles.socialContainer}>
        <h3>Follow Us</h3>
        <div className={styles.socialLinks}>
          <a href="#" aria-label="Facebook">
            Facebook
          </a>
          <a href="#" aria-label="Instagram">
            Instagram
          </a>
          <a href="#" aria-label="Twitter">
            Twitter
          </a>
          <a href="#" aria-label="YouTube">
            YouTube
          </a>
        </div>
      </div>
    </div>
  );
}

