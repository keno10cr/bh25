"use client";

import { useState, useEffect } from "react";
import styles from "./contact-form.module.css";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if subject or villa is in URL params (from activity link or villa link)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const subjectParam = params.get("subject");
      const villaParam = params.get("villa");
      
      if (subjectParam === "activities") {
        setFormData((prev) => ({
          ...prev,
          subject: "activities",
        }));
      } else if (villaParam) {
        setFormData((prev) => ({
          ...prev,
          subject: "booking",
          message: `I'm interested in Villa #${villaParam}. Please provide more information.`,
        }));
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <div className={styles.formContainer}>
      <h2>Send us a Message</h2>

      {submitted && (
        <div className={styles.successMessage}>
          <p>Thank you for your message! We'll get back to you soon.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="john@example.com"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="subject">Subject</label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          >
            <option value="">Select a subject</option>
            <option value="booking">Villa Booking</option>
            <option value="activities">Activity Inquiry</option>
            <option value="general">General Inquiry</option>
            <option value="feedback">Feedback</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Your message here..."
            rows={6}
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>

      <div className={styles.videoContainer}>
        <h3>Our Blessed House</h3>
        <div className={styles.videoWrapper}>
          <iframe
            src="https://player.vimeo.com/video/228500255?h=7c3b5c0e9f"
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Welcome to Blessed House"
          ></iframe>
        </div>
        <p className={styles.videoCredit}>
          Video by{" "}
          <a
            href="https://vimeo.com/ensofilmscr"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.videoLink}
          >
            ENSO Films
          </a>
        </p>
      </div>
    </div>
  );
}
