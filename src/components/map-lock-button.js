"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./map-lock-button.module.css";

const LOCK_COPY = {
  en: { unlock: "Unlock map", lock: "Lock map" },
  es: { unlock: "Desbloquear mapa", lock: "Bloquear mapa" },
  de: { unlock: "Karte entsperren", lock: "Karte sperren" },
  nl: { unlock: "Kaart ontgrendelen", lock: "Kaart vergrendelen" },
  fr: { unlock: "Déverrouiller la carte", lock: "Verrouiller la carte" },
  ja: { unlock: "地図のロックを解除", lock: "地図をロック" },
  pt: { unlock: "Desbloquear mapa", lock: "Bloquear mapa" },
  ar: { unlock: "فتح الخريطة", lock: "قفل الخريطة" },
};

function LockIcon({ locked }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      {locked ? (
        <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M8 11V7a4 4 0 0 1 7.5-1.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

export default function MapLockButton({ locked, onToggle, className = "" }) {
  const { language } = useLanguage();
  const copy = LOCK_COPY[language] || LOCK_COPY.en;

  return (
    <button
      type="button"
      className={`${styles.lockBtn} ${locked ? "" : styles.lockBtnOpen} ${className}`}
      onClick={onToggle}
      aria-pressed={!locked}
    >
      <LockIcon locked={locked} />
      <span>{locked ? copy.unlock : copy.lock}</span>
    </button>
  );
}
