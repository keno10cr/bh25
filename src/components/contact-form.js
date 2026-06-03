"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { trackContactFormSubmitted } from "@/lib/posthog";
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
    website: "",
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

  const getSpamError = (data) => {
    const name = data.name || "";
    const email = data.email || "";
    const message = data.message || "";
    const website = data.website || "";

    const emailLower = email.toLowerCase().trim();
    if (emailLower.endsWith("@gmail.com")) {
      const parts = emailLower.split("@");
      const local = parts[0] || "";
      const dotCount = (local.match(/\./g) || []).length;
      if (dotCount > 2) {
        return { field: "email", message: "Spam detected: Too many dots." };
      }
    }

    if (name.length > 10 && !name.includes(" ")) {
      return { field: "name", message: "Spam detected: Invalid name format." };
    }

    if (message.length > 5 && !message.includes(" ")) {
      return { field: "message", message: "Spam detected: Invalid message format." };
    }

    const midCaps = (str) => {
      const rest = str.slice(1);
      const match = rest.match(/[A-Z]/g) || [];
      return match.length;
    };

    if (midCaps(name) > 3) {
      return { field: "name", message: "Spam detected: High entropy string." };
    }

    if (website.trim().length > 0) {
      return { field: "form", message: "Spam detected." };
    }

    return null;
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

    if (Object.keys(newErrors).length === 0) {
      const spamResult = getSpamError(formData);
      if (spamResult) {
        if (spamResult.field === "form") {
          setFormError(spamResult.message);
        } else {
          newErrors[spamResult.field] = spamResult.message;
        }
      }
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

      trackContactFormSubmitted({
        form_subject: formData.subject,
        input_language: language,
      });

      setSubmitted(true);
      setErrors({});
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        website: "",
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

        <div className={styles.honeypot}>
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            autoComplete="off"
            tabIndex={-1}
          />
        </div>

        {formError && <p className={styles.errorText}>{formError}</p>}
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? t("contact.sending") : t("contact.send")}
        </button>
      </form>

      <div className={styles.chargingNote}>
        <div className={styles.chargingIconWrapper}>
          <Image 
            src="/info/ChargingStation.jpg" 
            alt="Charging Station" 
            width={40}
            height={40}
            className={styles.chargingIcon}
          />
        </div>
        <p>{t("footer.parkingFee")}</p>
      </div>

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
