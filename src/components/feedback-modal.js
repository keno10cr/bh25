"use client";

import { useEffect, useId, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  COMMENT_MAX_LENGTH,
  COMMENT_MIN_LENGTH,
  commentLength,
  getCommentLengthCode,
} from "@/lib/comment-length";
import { useTranslation } from "@/lib/translations";
import styles from "./feedback-modal.module.css";

function fillCopy(template, values) {
  return String(template || "").replace(/\{(\w+)\}/g, (_, key) =>
    values[key] == null ? `{${key}}` : String(values[key])
  );
}

export default function FeedbackModal({
  open,
  onClose,
  formType = "guestExperience",
  villaId = "",
  villaName = "",
}) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const titleId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("5");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setDone(false);
      setError("");
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const messageLength = commentLength(message);
  const lengthCode = getCommentLengthCode(message);
  const lengthValues = {
    min: COMMENT_MIN_LENGTH,
    max: COMMENT_MAX_LENGTH,
    count: messageLength,
  };
  const lengthHint = fillCopy(t("feedback.lengthHint"), lengthValues);
  const lengthMessage = lengthCode
    ? fillCopy(t(`feedback.${lengthCode}`), lengthValues)
    : lengthHint;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (lengthCode) {
      setError(lengthMessage);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType,
          name,
          email,
          rating: Number(rating),
          message,
          villaId,
          language,
          website,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || t("feedback.error"));
      }
      setDone(true);
      setName("");
      setEmail("");
      setMessage("");
      setRating("5");
    } catch (err) {
      setError(err.message || t("feedback.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label={t("feedback.close")}>
          ×
        </button>
        <h2 id={titleId} className={done ? styles.thanksTitle : undefined}>
          {formType === "villaComment"
            ? t("feedback.villaTitle")
            : t("feedback.title")}
        </h2>
        {done ? (
          <div className={styles.success}>
            <p>{t("feedback.thanks")}</p>
            <button type="button" className={styles.submit} onClick={onClose}>
              {t("feedback.close")}
            </button>
          </div>
        ) : (
          <>
            <p className={styles.lead}>
              {formType === "villaComment"
                ? t("feedback.villaPrompt").replace("{villa}", villaName || "")
                : t("feedback.prompt")}
            </p>
            <form onSubmit={handleSubmit} className={styles.form}>
            <label>
              <span>{t("feedback.name")}</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={80}
              />
            </label>
            <label>
              <span>{t("feedback.email")}</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                maxLength={120}
              />
            </label>
            <label>
              <span>{t("feedback.rating")}</span>
              <select value={rating} onChange={(event) => setRating(event.target.value)}>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t("feedback.message")}</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                rows={5}
                minLength={COMMENT_MIN_LENGTH}
                maxLength={COMMENT_MAX_LENGTH}
                className={lengthCode && messageLength > 0 ? styles.invalid : undefined}
                aria-describedby={`${titleId}-length`}
              />
              <p
                id={`${titleId}-length`}
                className={`${styles.lengthHint} ${
                  lengthCode && messageLength > 0 ? styles.lengthError : ""
                }`}
              >
                {messageLength > 0 ? lengthMessage : lengthHint}
                {" "}
                {fillCopy(t("feedback.charCount"), lengthValues)}
              </p>
            </label>
            <input
              className={styles.honeypot}
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              aria-hidden="true"
            />
            {error ? <p className={styles.error}>{error}</p> : null}
            <button
              type="submit"
              className={styles.submit}
              disabled={loading || Boolean(lengthCode)}
            >
              {loading ? t("feedback.sending") : t("feedback.send")}
            </button>
          </form>
          </>
        )}
      </div>
    </div>
  );
}
