"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { trackContactFormSubmitted } from "@/lib/posthog";
import CmsText from "@/components/cms-text";
import { resolveCopy } from "@/lib/cms-field";
import {
  CONTACT_VILLAS,
  CONTACT_ACTIVITIES,
  SUBJECT_OPTIONS,
} from "@/lib/contact-options";
import styles from "./contact-form.module.css";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  website: "",
  villaId: "",
  checkIn: "",
  checkOut: "",
  activityId: "",
  activityDate: "",
};

export default function ContactForm({ copy }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const formTitle = resolveCopy(copy?.formTitle, t("contactPage.formTitle"), language);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const subjectParam = params.get("subject");
    const villaParam = params.get("villa");
    const propertyParam = params.get("property");
    const checkInParam = params.get("checkIn") || "";
    const checkOutParam = params.get("checkOut") || "";
    const adultsParam = params.get("adults");
    const childrenParam = params.get("children");

    let villaId = "";
    if (villaParam) {
      const villaExists = CONTACT_VILLAS.some(
        (villa) => String(villa.id) === String(villaParam)
      );
      if (villaExists) villaId = String(villaParam);
    }
    if (!villaId && propertyParam) {
      const bySlug = CONTACT_VILLAS.find(
        (villa) => villa.slug === propertyParam
      );
      if (bySlug) villaId = String(bySlug.id);
    }

    const isBookingPrefill =
      subjectParam === "booking" || Boolean(villaId) || Boolean(propertyParam);

    if (subjectParam === "activities") {
      setFormData((prev) => ({
        ...prev,
        subject: "activities",
      }));
      return;
    }

    if (!isBookingPrefill) return;

    const guestParts = [];
    if (adultsParam) {
      const adults = Number(adultsParam);
      if (Number.isFinite(adults) && adults > 0) {
        guestParts.push(`${adults} adult${adults === 1 ? "" : "s"}`);
      }
    }
    if (childrenParam) {
      const children = Number(childrenParam);
      if (Number.isFinite(children) && children > 0) {
        guestParts.push(`${children} child${children === 1 ? "" : "ren"}`);
      }
    }

    const messageParts = [];
    if (checkInParam || checkOutParam) {
      messageParts.push(
        `Requested dates: ${checkInParam || "TBD"} to ${checkOutParam || "TBD"}.`
      );
    }
    if (guestParts.length) {
      messageParts.push(`Guests: ${guestParts.join(", ")}.`);
    }
    if (propertyParam) {
      messageParts.push(`Property: ${propertyParam}.`);
    }

    setFormData((prev) => ({
      ...prev,
      subject: "booking",
      villaId,
      checkIn: checkInParam,
      checkOut: checkOutParam,
      message: messageParts.length
        ? `${messageParts.join(" ")}\n\n`
        : prev.message,
    }));
  }, []);

  const clearFieldError = (name) => {
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    clearFieldError(name);
  };

  const handleSubjectSelect = (subject) => {
    setFormData((prev) => ({
      ...prev,
      subject,
      villaId: "",
      checkIn: "",
      checkOut: "",
      activityId: "",
      activityDate: "",
    }));
    clearFieldError("subject");
    clearFieldError("villaId");
    clearFieldError("activityId");
  };

  const validateEmail = (email) => {
    return email.includes("@") && email.split("@").length === 2;
  };

  const validatePhone = (phone) => {
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

    if (formData.subject === "booking" && !formData.villaId) {
      newErrors.villaId = t("contact.selectVillaError");
    }

    if (
      formData.subject === "booking" &&
      formData.checkIn &&
      formData.checkOut &&
      formData.checkOut < formData.checkIn
    ) {
      newErrors.checkOut = t("contact.dateRangeError");
    }

    if (formData.subject === "activities" && !formData.activityId) {
      newErrors.activityId = t("contact.selectActivityError");
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

    const selectedVilla = CONTACT_VILLAS.find(
      (villa) => String(villa.id) === String(formData.villaId)
    );
    const selectedActivity = CONTACT_ACTIVITIES.find(
      (activity) => String(activity.id) === String(formData.activityId)
    );

    const payload = {
      ...formData,
      villaName: selectedVilla?.name || "",
      villaMaxPeople: selectedVilla?.maxPeople || "",
      villaSlug: selectedVilla?.slug || "",
      language,
      activityName: selectedActivity
        ? t(`activitiesPage.${selectedActivity.translationKey}.name`)
        : "",
    };

    setLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
      setFormData(EMPTY_FORM);

      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Contact form submission failed:", error);
      setFormError(t("contactPage.errorMessage"));
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const peopleLabel = t("contact.maxPeopleShort");

  return (
    <div className={styles.formContainer}>
      <h2>
        <CmsText fromCms={formTitle.fromCms}>{formTitle.value}</CmsText>
      </h2>

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
          <span className={styles.groupLabel}>
            {t("contact.subject")} <span className={styles.required}>*</span>
          </span>
          <div
            className={`${styles.subjectOptions} ${
              errors.subject ? styles.subjectOptionsError : ""
            }`}
            role="radiogroup"
            aria-label={t("contact.subject")}
          >
            {SUBJECT_OPTIONS.map((option) => {
              const isSelected = formData.subject === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`${styles.subjectOption} ${
                    isSelected ? styles.subjectOptionSelected : ""
                  }`}
                  onClick={() => handleSubjectSelect(option.value)}
                  data-track={`contact-subject-${option.value}`}
                >
                  <span className={styles.subjectIcon}>
                    <img src={option.icon} alt="" width={48} height={48} />
                  </span>
                  <span className={styles.subjectLabel}>
                    {t(`contact.${option.labelKey}`)}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.subject && (
            <span className={styles.errorText}>{errors.subject}</span>
          )}
        </div>

        {formData.subject === "booking" && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="villaId">
                {t("contact.selectVilla")}{" "}
                <span className={styles.required}>*</span>
              </label>
              <select
                id="villaId"
                name="villaId"
                value={formData.villaId}
                onChange={handleChange}
                className={errors.villaId ? styles.inputError : ""}
              >
                <option value="">{t("contact.selectVillaPlaceholder")}</option>
                {CONTACT_VILLAS.map((villa) => (
                  <option key={villa.id} value={villa.id}>
                    {villa.name} ({peopleLabel}: {villa.maxPeople})
                  </option>
                ))}
              </select>
              {errors.villaId && (
                <span className={styles.errorText}>{errors.villaId}</span>
              )}
            </div>

            {formData.villaId && (
              <div className={styles.formGroup}>
                <span className={styles.groupLabel}>
                  {t("contact.possibleDates")}{" "}
                  <span className={styles.optional}>
                    ({t("contact.optional")})
                  </span>
                </span>
                <div className={styles.dateRow}>
                  <div className={styles.dateField}>
                    <label htmlFor="checkIn">{t("contact.checkIn")}</label>
                    <input
                      type="date"
                      id="checkIn"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className={styles.dateField}>
                    <label htmlFor="checkOut">{t("contact.checkOut")}</label>
                    <input
                      type="date"
                      id="checkOut"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleChange}
                      min={
                        formData.checkIn ||
                        new Date().toISOString().split("T")[0]
                      }
                      className={errors.checkOut ? styles.inputError : ""}
                    />
                    {errors.checkOut && (
                      <span className={styles.errorText}>{errors.checkOut}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {formData.subject === "activities" && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="activityId">
                {t("contact.selectActivity")}{" "}
                <span className={styles.required}>*</span>
              </label>
              <select
                id="activityId"
                name="activityId"
                value={formData.activityId}
                onChange={handleChange}
                className={errors.activityId ? styles.inputError : ""}
              >
                <option value="">{t("contact.selectActivityPlaceholder")}</option>
                {CONTACT_ACTIVITIES.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {t(`activitiesPage.${activity.translationKey}.name`)}
                  </option>
                ))}
              </select>
              {errors.activityId && (
                <span className={styles.errorText}>{errors.activityId}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="activityDate">
                {t("contact.possibleActivityDate")}{" "}
                <span className={styles.optional}>
                  ({t("contact.optional")})
                </span>
              </label>
              <input
                type="date"
                id="activityDate"
                name="activityDate"
                value={formData.activityDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </>
        )}

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
          {errors.message && (
            <span className={styles.errorText}>{errors.message}</span>
          )}
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
