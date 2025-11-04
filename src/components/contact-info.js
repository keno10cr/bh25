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
                    <a
                        href="https://maps.app.goo.gl/fVczYNsY2TwfF23d6"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.addressLink}
                    >
                        View on Google Maps →
                    </a>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.icon}>📞</div>
                    <h3>Phone</h3>
                    <p>
                        <a href="tel:+17546104710" className={styles.contactLink}>
                            +1 (754) 610-4710
                        </a>
                    </p>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.icon}>✉️</div>
                    <h3>Email</h3>
                    <p>
                        <a href="mailto:blessedhousecr@gmail.com" className={styles.contactLink}>
                            blessedhousecr@gmail.com
                        </a>
                    </p>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.icon}>⏰</div>
                    <h3>Hours</h3>
                    <p>Mon - Sun: 8:00 AM - 10:00 PM</p>
                    <p>Feel free to contact us</p>
                </div>
            </div>

            <div className={styles.directionsContainer}>
                <h3>How to get here</h3>
                <p>
                    From the crossroad at Hone Creek, keep on straight towards Puerto Viejo for 2.5kms, our entrance is on the right side of the road.
                </p>
                <p>
                    You can find us on Google Maps: <strong>"Blessed House Puerto Viejo de Talamanca"</strong>
                </p>
                <a
                    href="https://maps.app.goo.gl/fVczYNsY2TwfF23d6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapLink}
                >
                    Get directions from Google Maps →
                </a>
                <p className={styles.coordinates}>
                <br/>Coordinates: <br/> 9.647346, -82.776973
                </p>
            </div>

            <div className={styles.mapContainer}>
                <h3>Find Us Here</h3>

                {/* <iframe src="" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe> */}

                <div className={styles.map}>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3933.3938841788026!2d-82.77954832426032!3d9.647345590440827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa65a801c5aaaab%3A0xfe3832c538d76ec3!2sBlessed%20House%20Puerto%20Viejo%20de%20Talamanca!5e0!3m2!1ses-419!2scr!4v1762142170514!5m2!1ses-419!2scr"
                        width="100%"
                        height="300"
                        style={{ border: 0, borderRadius: "12px" }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </div>
        </div>
    );
}
