"use client";

import { useEffect, useRef, useState } from "react";
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
  const caption = t("footer.ictCertified");

  return (
    <div
      ref={ref}
      className={[styles.badge, visible ? styles.visible : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        src={LOGO.src}
        alt={LOGO.alt}
        width={LOGO.width}
        height={LOGO.height}
        className={styles.logo}
      />
      <p className={styles.caption}>{caption}</p>
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
