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
  const [errors, setErrors] = useState({});

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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateEmail = (email) => {
    // Check for @ symbol - basic validation
    return email.includes("@") && email.split("@").length === 2;
  };

  const validatePhone = (phone) => {
    // Remove all non-digit characters and check if at least 8 digits
    const digitsOnly = phone.replace(/\D/g, "");
    return digitsOnly.length === 0 || digitsOnly.length >= 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Phone number must contain at least 8 digits";
    }
    
    if (!formData.subject) {
      newErrors.subject = "Please select a subject";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setErrors({});
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
          <label htmlFor="name">
            Full Name <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={errors.name ? styles.inputError : ""}
          />
          {errors.name && <span className={styles.errorText}>{errors.name}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">
            Email Address <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className={errors.email ? styles.inputError : ""}
          />
          {errors.email && <span className={styles.errorText}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="########"
            className={errors.phone ? styles.inputError : ""}
          />
          {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="subject">
            Subject <span className={styles.required}>*</span>
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={errors.subject ? styles.inputError : ""}
          >
            <option value="">Select a subject</option>
            <option value="booking">Villa Booking</option>
            <option value="activities">Activity Inquiry</option>
            <option value="general">General Inquiry</option>
            <option value="feedback">Feedback</option>
            <option value="other">Other</option>
          </select>
          {errors.subject && <span className={styles.errorText}>{errors.subject}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message">
            Message <span className={styles.required}>*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your message here..."
            rows={6}
            className={errors.message ? styles.inputError : ""}
          />
          {errors.message && <span className={styles.errorText}>{errors.message}</span>}
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
