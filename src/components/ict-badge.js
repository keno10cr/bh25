"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./ict-badge.module.css";

const LOGO = {
  src: "/images/logo-ict-costarica.png",
  width: 300,
  height: 96,
  alt: "Instituto Costarricense de Turismo",
};

function useFadeUp() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export default function IctBadge() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const { ref, visible } = useFadeUp();
  const tipId = useId();
  const [open, setOpen] = useState(false);
  const caption = t("footer.ictCertified");
  const tooltip = t("footer.ictTooltip");

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((value) => !value);
    }
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-describedby={tipId}
      className={[
        styles.badge,
        visible ? styles.visible : "",
        open ? styles.open : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => setOpen((value) => !value)}
      onKeyDown={onKeyDown}
    >
      <Image
        src={LOGO.src}
        alt={LOGO.alt}
        width={LOGO.width}
        height={LOGO.height}
        className={styles.logo}
      />
      <p className={styles.caption}>{caption}</p>
      <p className={styles.tooltip} id={tipId} role="tooltip">
        {tooltip}
      </p>
    </div>
  );
}

export function IctBadgeBand({ plain = false }) {
  return (
    <div className={plain ? styles.bandPlain : styles.band}>
      <IctBadge />
    </div>
  );
}
