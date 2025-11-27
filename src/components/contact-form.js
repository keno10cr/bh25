"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./contact-form.module.css";

export default function ContactForm() {
  const { language } = useLanguage();
  const t = useTranslation(language);
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
  const [formError, setFormError] = useState("");

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
    setFormError("");
    
    if (!formData.name.trim()) {
      newErrors.name = `${t("contact.name")} ${t("contact.required")}`;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = `${t("contact.email")} ${t("contact.required")}`;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t("contact.validEmail");
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = t("contact.phoneDigits");
    }
    
    if (!formData.subject) {
      newErrors.subject = t("contact.selectSubjectError");
    }
    
    if (!formData.message.trim()) {
      newErrors.message = `${t("contact.message")} ${t("contact.required")}`;
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to send message");
      }

      setSubmitted(true);
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
    } catch (error) {
      console.error("Contact form submission failed:", error);
      setFormError(t("contactPage.errorMessage"));
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>{t("contactPage.formTitle")}</h2>

      {submitted && (
        <div className={styles.successMessage}>
          <p>{t("contactPage.successMessage")}</p>
        </div>
      )}

      {formError && (
        <div className={styles.errorBanner}>
          <p>{formError}</p>
        </div>
      )}
 
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">
            {t("contact.name")} <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t("contact.name")}
            className={errors.name ? styles.inputError : ""}
          />
          {errors.name && <span className={styles.errorText}>{errors.name}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">
            {t("contact.email")} <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("contact.email")}
            className={errors.email ? styles.inputError : ""}
          />
          {errors.email && <span className={styles.errorText}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">{t("contact.phone")}</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t("contact.phone")}
            className={errors.phone ? styles.inputError : ""}
          />
          {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="subject">
            {t("contact.subject")} <span className={styles.required}>*</span>
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={errors.subject ? styles.inputError : ""}
          >
            <option value="">{t("contact.selectSubject")}</option>
            <option value="booking">{t("contact.booking")}</option>
            <option value="activities">{t("contact.activityInquiry")}</option>
            <option value="general">{t("contact.generalInquiry")}</option>
            <option value="feedback">{t("contact.feedback")}</option>
            <option value="other">{t("contact.other")}</option>
          </select>
          {errors.subject && <span className={styles.errorText}>{errors.subject}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message">
            {t("contact.message")} <span className={styles.required}>*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder={t("contact.message")}
            rows={6}
            className={errors.message ? styles.inputError : ""}
          />
          {errors.message && <span className={styles.errorText}>{errors.message}</span>}
        </div>

        {formError && <p className={styles.errorText}>{formError}</p>}
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? t("contact.sending") : t("contact.send")}
        </button>
      </form>

      <div className={styles.videoContainer}>
        <h3>{t("contact.videoTitle")}</h3>
        <div className={styles.videoWrapper}>
          <iframe
            src="https://player.vimeo.com/video/228500255?h=7c3b5c0e9f"
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            title={t("contact.videoTitle")}
          ></iframe>
        </div>
        <p className={styles.videoCredit}>
          {t("contact.videoCredit")}{" "}
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
