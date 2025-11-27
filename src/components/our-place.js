"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./our-place.module.css";

export default function OurPlace() {
    const imageRef = useRef(null);
    const sectionRef = useRef(null);
    const [imageOffset, setImageOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (sectionRef.current && imageRef.current) {
                const rect = sectionRef.current.getBoundingClientRect();
                const sectionTop = rect.top + window.scrollY;
                const scrollPosition = window.scrollY;

                // Only apply parallax when section is in viewport
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const scrolled = scrollPosition - sectionTop;
                    const rate = scrolled * 0.3; // Move image down as we scroll down
                    setImageOffset(rate);
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Call once on mount
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className={styles.section} ref={sectionRef}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.imageWrapper}>
                        <div
                            className={styles.imageContainer}
                            ref={imageRef}
                            style={{ transform: `translateY(${imageOffset}px)` }}
                        >
                            <img
                                src="/villas/general/junglepool.jpg"
                                alt="Blessed House pool area"
                                className={styles.image}
                            />
                        </div>
                    </div>
                    <div className={styles.textContent}>
                        <h2>Our Place</h2>
                        <p>
                            Welcome to Blessed House, a tranquil and spacious property nestled in the rich mountains near Puerto Viejo. We offer an authentic Caribbean experience surrounded by incredible nature and just a short distance from the beaches. Here, you'll enjoy a healthy, eco-friendly environment where wildlife, from sloths to hummingbirds, is part of the scenery. Our comfortable villas and shared pool area are designed for your complete relaxation and enjoyment.
                        </p>
                        <Link href="/contact" className={styles.ctaButton}>
                            Contact Us
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
