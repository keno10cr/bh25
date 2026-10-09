"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSmoothParallax } from "@/lib/parallax-motion";
import DateRangePicker, {
  formatRangeLabel,
} from "@/components/date-range-picker";
import { languages, useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { resolveCopy } from "@/lib/cms-field";
import { localizedOnly } from "@/lib/localized";
import {
  PVG_PILLARS_DEFAULTS,
  PVG_CAPACITY_SPECS_DEFAULTS,
  PVG_PAGE_DEFAULTS,
} from "@/data/pvg-defaults";
import { IctBadgeBand } from "@/components/ict-badge";
import styles from "./pvg.module.css";

const ActivitiesMap = dynamic(() => import("@/components/activities-map"), {
  ssr: false,
});

const EMPTY_FORM = {
  organizationName: "",
  attendees: "",
  contactName: "",
  email: "",
  website: "",
};

const EMPTY_RANGE = { checkIn: "", checkOut: "" };

const ATTENDEE_RANGE_IDS = ["20-29", "30-39", "40-45"];
const ATTENDEE_RANGE_FALLBACK = ["20 to 29", "30 to 39", "40 to 45"];

const DRAG_CLICK_THRESHOLD = 6;

function resolveActivityLabel(image, t, language) {
  if (image.labelKey) {
    const labeled = t(`pvg.activityLabels.${image.labelKey}`);
    if (labeled && !String(labeled).startsWith("pvg.")) return labeled;
  }

  const translated = image.translationKey
    ? t(`activitiesPage.${image.translationKey}.name`)
    : "";
  const fromTranslation =
    translated && !translated.startsWith("activitiesPage.") ? translated : "";
  const raw =
    fromTranslation ||
    localizedOnly(image, "title", language) ||
    image.title ||
    image.alt ||
    "Activity";
  const lower = String(raw).toLowerCase();

  // CMS titles like "Playa Negra @ Tennis" without a translation key
  if (
    (lower.includes("tennis") && lower.includes("negra")) ||
    (String(image.slug || "").includes("tennis") &&
      String(image.slug || "").includes("negra"))
  ) {
    const labeled = t("pvg.activityLabels.tennisNearPlayaNegra");
    if (labeled && !String(labeled).startsWith("pvg.")) return labeled;
  }

  return raw;
}

function resolveActivityDescription(image, t, language) {
  const translated = image.translationKey
    ? t(`activitiesPage.${image.translationKey}.description`)
    : "";
  const fromTranslation =
    translated && !String(translated).startsWith("activitiesPage.")
      ? translated
      : "";
  if (language !== "en" && fromTranslation) return fromTranslation;
  return (
    localizedOnly(image, "description", language) ||
    image.description ||
    fromTranslation ||
    ""
  );
}

function shortDescription(text, max = 220) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const sentences = clean.match(/[^.!?。]+[.!?。]+/g) || [clean];
  let out = "";
  for (const sentence of sentences) {
    const next = `${out} ${sentence}`.trim();
    if (out && next.length > max) break;
    out = next;
    if (out.length >= max * 0.6) break;
  }
  if (out.length > max + 40) {
    out = `${out.slice(0, max).replace(/\s+\S*$/, "")}…`;
  }
  return out;
}

function textValue(field, fallback, language, tKey, t) {
  return resolveCopy(field, t(tKey) || fallback, language).value;
}

function PawIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g fill="currentColor">
        <ellipse cx="6" cy="9.5" rx="2.1" ry="2.6" />
        <ellipse cx="10" cy="5.6" rx="2.1" ry="2.7" />
        <ellipse cx="14" cy="5.6" rx="2.1" ry="2.7" />
        <ellipse cx="18" cy="9.5" rx="2.1" ry="2.6" />
        <path d="M12 11c-2.9 0-6 3.4-6 6.2 0 1.8 1.4 2.8 3 2.8 1.2 0 2-.6 3-.6s1.8.6 3 .6c1.6 0 3-1 3-2.8 0-2.8-3.1-6.2-6-6.2z" />
      </g>
    </svg>
  );
}

function StepBadge({ n }) {
  return (
    <span className={styles.stepBadge} aria-hidden="true">
      {n}
    </span>
  );
}

export default function PvgClient({ mapPin, galleryImages = [], copy = null }) {
  const searchParams = useSearchParams();
  const { language, changeLanguage } = useLanguage();
  const t = useTranslation(language);
  const heroRef = useRef(null);
  const imageRef = useRef(null);
  const formRef = useRef(null);
  const capacityRef = useRef(null);
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const modalOpenRef = useRef(false);
  const [petsOpen, setPetsOpen] = useState(false);
  const dragState = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    baseX: 0,
    moved: false,
    index: null,
  });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [ranges, setRanges] = useState([{ ...EMPTY_RANGE }]);
  const [rangeCount, setRangeCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [showFixHint, setShowFixHint] = useState(false);
  const [errors, setErrors] = useState({});
  const [marqueeDragging, setMarqueeDragging] = useState(false);
  const [capacityVisible, setCapacityVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  modalOpenRef.current = activeImageIndex !== null;

  useEffect(() => {
    const lang = String(searchParams.get("lang") || "").toLowerCase();
    if (languages[lang]) {
      changeLanguage(lang);
    }
  }, [searchParams, changeLanguage]);

  useSmoothParallax((loop) => {
    const hero = heroRef.current;
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
      loop.set(imageRef.current, { y: 0, lerp: 0.2 });
      return;
    }
    loop.set(imageRef.current, { y: -rect.top * 0.35, lerp: 0.16 });
  }, []);

  useEffect(() => {
    const el = capacityRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setCapacityVisible(entry.intersectionRatio >= 0.3),
      { threshold: [0, 0.3] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || galleryImages.length === 0) return undefined;

    let frameId = 0;
    let lastTs = 0;
    const speedPxPerSec = 36;

    const wrapOffset = (value) => {
      const loopWidth = track.scrollWidth / 2;
      if (loopWidth <= 0) return value;
      let next = value;
      while (next <= -loopWidth) next += loopWidth;
      while (next > 0) next -= loopWidth;
      return next;
    };

    const tick = (ts) => {
      if (!lastTs) lastTs = ts;
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;

      if (!dragState.current.active && !modalOpenRef.current) {
        offsetRef.current = wrapOffset(offsetRef.current - speedPxPerSec * dt);
        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [galleryImages.length]);

  const closeModal = useCallback(() => setActiveImageIndex(null), []);
  const stepModal = useCallback(
    (delta) => {
      if (galleryImages.length === 0) return;
      setActiveImageIndex((index) =>
        index === null
          ? index
          : (index + delta + galleryImages.length) % galleryImages.length
      );
    },
    [galleryImages.length]
  );

  useEffect(() => {
    if (activeImageIndex === null) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") closeModal();
      if (event.key === "ArrowRight") stepModal(1);
      if (event.key === "ArrowLeft") stepModal(-1);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [activeImageIndex, closeModal, stepModal]);

  useEffect(() => {
    if (!petsOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setPetsOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [petsOpen]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormError("");
    setShowFixHint(false);
  };

  const updateRange = (index, nextRange) => {
    setRanges((prev) =>
      prev.map((range, i) => (i === index ? nextRange : range))
    );
    setErrors((prev) => ({ ...prev, dateRanges: "" }));
    setShowFixHint(false);
  };

  const clearRange = (index) => {
    setRanges((prev) =>
      prev.map((range, i) => (i === index ? { ...EMPTY_RANGE } : range))
    );
  };

  const addRange = () => {
    if (rangeCount >= 3) return;
    const current = ranges[rangeCount - 1];
    if (!current?.checkIn || !current?.checkOut) return;
    setRanges((prev) => {
      const next = [...prev];
      while (next.length < rangeCount + 1) next.push({ ...EMPTY_RANGE });
      return next;
    });
    setRangeCount((n) => n + 1);
  };

  const visibleRanges = ranges.slice(0, rangeCount);
  const lastVisible = visibleRanges[visibleRanges.length - 1];
  const canAddAnother =
    rangeCount < 3 && Boolean(lastVisible?.checkIn && lastVisible?.checkOut);

  const onMarqueePointerDown = (event) => {
    if (event.button != null && event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;

    const item = event.target.closest?.("[data-gallery-index]");
    dragState.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      baseX: offsetRef.current,
      moved: false,
      index: item ? Number(item.dataset.galleryIndex) : null,
    };
    setMarqueeDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onMarqueePointerMove = (event) => {
    if (!dragState.current.active) return;
    if (
      dragState.current.pointerId != null &&
      event.pointerId !== dragState.current.pointerId
    ) {
      return;
    }
    const track = trackRef.current;
    if (!track) return;

    const dx = event.clientX - dragState.current.startX;
    if (Math.abs(dx) > DRAG_CLICK_THRESHOLD) dragState.current.moved = true;
    const nextX = dragState.current.baseX + dx;
    offsetRef.current = nextX;
    track.style.transform = `translate3d(${nextX}px, 0, 0)`;
  };

  const onMarqueePointerUp = (event) => {
    if (!dragState.current.active) return;
    if (
      dragState.current.pointerId != null &&
      event.pointerId !== dragState.current.pointerId
    ) {
      return;
    }

    const track = trackRef.current;
    const loopWidth = track ? track.scrollWidth / 2 : 0;
    if (loopWidth > 0) {
      let next = offsetRef.current;
      while (next <= -loopWidth) next += loopWidth;
      while (next > 0) next -= loopWidth;
      offsetRef.current = next;
      if (track) track.style.transform = `translate3d(${next}px, 0, 0)`;
    }

    const { moved, index } = dragState.current;
    const isTap = event.type === "pointerup" && !moved && index !== null;

    dragState.current.active = false;
    dragState.current.pointerId = null;
    setMarqueeDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    if (isTap && galleryImages.length > 0) {
      setActiveImageIndex(index % galleryImages.length);
    }
  };

  const validate = () => {
    const next = {};
    if (!formData.organizationName.trim()) {
      next.organizationName = "Organization name is required.";
    }
    if (!ATTENDEE_RANGE_IDS.includes(formData.attendees)) {
      next.attendees = "Choose your group size.";
    }

    const completeRanges = visibleRanges.filter((r) => r.checkIn && r.checkOut);
    if (completeRanges.length === 0) {
      next.dateRanges = "Select at least one date range.";
    } else {
      const incomplete = visibleRanges.some(
        (r) => (r.checkIn && !r.checkOut) || (!r.checkIn && r.checkOut)
      );
      if (incomplete) {
        next.dateRanges = "Finish each open date range.";
      }
    }

    if (!formData.contactName.trim()) {
      next.contactName = "Contact name is required.";
    }
    if (!formData.email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      next.email = "Enter a valid email.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      setShowFixHint(true);
      return;
    }

    const dateRanges = visibleRanges.filter((r) => r.checkIn && r.checkOut);

    setLoading(true);
    setFormError("");
    setShowFixHint(false);

    try {
      const response = await fetch("/api/group-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          dateRanges,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFormError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
      setFormData(EMPTY_FORM);
      setRanges([{ ...EMPTY_RANGE }]);
      setRangeCount(1);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loopImages = [...galleryImages, ...galleryImages];

  const heroBrandLine = textValue(
    copy?.heroBrandLine,
    PVG_PAGE_DEFAULTS.heroBrandLine,
    language,
    "pvg.heroBrandLine",
    t
  );
  const heroHeadline = textValue(
    copy?.heroHeadline,
    PVG_PAGE_DEFAULTS.heroHeadline,
    language,
    "pvg.heroHeadline",
    t
  );
  const heroCta = textValue(
    copy?.heroCta,
    PVG_PAGE_DEFAULTS.heroCta,
    language,
    "pvg.heroCta",
    t
  );
  const heroImage =
    copy?.heroImage?.value || PVG_PAGE_DEFAULTS.heroImage;
  const heroImageAlt =
    copy?.heroImageAlt?.value || PVG_PAGE_DEFAULTS.heroImageAlt;

  const guaranteeLogo =
    copy?.guaranteeLogo?.value || PVG_PAGE_DEFAULTS.guaranteeLogo;
  const guaranteeTitle = textValue(
    copy?.guaranteeTitle,
    PVG_PAGE_DEFAULTS.guaranteeTitle,
    language,
    "pvg.guaranteeTitle",
    t
  );
  const guaranteeBody = textValue(
    copy?.guaranteeBody,
    PVG_PAGE_DEFAULTS.guaranteeBody,
    language,
    "pvg.guaranteeBody",
    t
  );

  const pillarsTitle = textValue(
    copy?.pillarsTitle,
    PVG_PAGE_DEFAULTS.pillarsTitle,
    language,
    "pvg.pillarsTitle",
    t
  );
  const pillarsSource =
    copy?.pillars?.length > 0 ? copy.pillars : PVG_PILLARS_DEFAULTS;
  const pillars = pillarsSource.map((pillar, index) => {
    const fallback = PVG_PILLARS_DEFAULTS[index] || {};
    const title = resolveCopy(
      { value: pillar.title, fromCms: Boolean(pillar.titleFromCms) },
      t(`pvg.pillars.${index}.title`) || pillar.title || fallback.title,
      language
    ).value;
    const body = resolveCopy(
      { value: pillar.body, fromCms: Boolean(pillar.bodyFromCms) },
      t(`pvg.pillars.${index}.body`) || pillar.body || fallback.body,
      language
    ).value;
    return {
      id: pillar.id || String(index),
      title,
      body,
      image: pillar.image || fallback.image || "",
    };
  });

  const capacityTitle = textValue(
    copy?.capacityTitle,
    PVG_PAGE_DEFAULTS.capacityTitle,
    language,
    "pvg.capacityTitle",
    t
  );
  const specsSource =
    copy?.capacitySpecs?.length > 0
      ? copy.capacitySpecs
      : PVG_CAPACITY_SPECS_DEFAULTS;
  const capacitySpecs = specsSource.map((spec, index) => {
    const fallback = PVG_CAPACITY_SPECS_DEFAULTS[index] || {};
    const label = resolveCopy(
      { value: spec.label, fromCms: Boolean(spec.labelFromCms) },
      t(`pvg.capacitySpecs.${index}.label`) || spec.label || fallback.label,
      language
    ).value;
    const text = resolveCopy(
      { value: spec.text, fromCms: Boolean(spec.textFromCms) },
      t(`pvg.capacitySpecs.${index}.text`) || spec.text || fallback.text,
      language
    ).value;
    return { id: spec.id || String(index), label, text };
  });

  const locationTitle = textValue(
    copy?.locationTitle,
    PVG_PAGE_DEFAULTS.locationTitle,
    language,
    "pvg.locationTitle",
    t
  );
  const locationLead = textValue(
    copy?.locationLead,
    PVG_PAGE_DEFAULTS.locationLead,
    language,
    "pvg.locationLead",
    t
  );
  const petsTitle = textValue(
    copy?.petsTitle,
    PVG_PAGE_DEFAULTS.petsTitle,
    language,
    "pvg.petsTitle",
    t
  );
  const petsNote = textValue(
    copy?.petsNote,
    PVG_PAGE_DEFAULTS.petsNote,
    language,
    "pvg.petsNote",
    t
  );
  const pageText = (key) =>
    textValue(copy?.[key], PVG_PAGE_DEFAULTS[key], language, `pvg.${key}`, t);
  const petsLinkLabel = pageText("petsLinkLabel");
  const locationLegendLabel = textValue(
    copy?.locationLegendLabel,
    PVG_PAGE_DEFAULTS.locationLegendLabel,
    language,
    "pvg.locationLegendLabel",
    t
  );
  const activitiesTitle = textValue(
    copy?.activitiesTitle,
    PVG_PAGE_DEFAULTS.activitiesTitle,
    language,
    "pvg.activitiesTitle",
    t
  );

  const mapViewLabelsRaw = t("pvg.mapViews");
  const mapViewLabels =
    mapViewLabelsRaw && typeof mapViewLabelsRaw === "object"
      ? mapViewLabelsRaw
      : {};
  const mapViews = mapPin
    ? [
        {
          id: "costaRica",
          label: mapViewLabels.costaRica || "Costa Rica",
          center: [-84.15, 9.75],
          zoom: 6.3,
        },
        {
          id: "caribeSur",
          label: mapViewLabels.caribeSur || "Caribe Sur",
          center: [-82.78, 9.65],
          zoom: 10.2,
        },
        {
          id: "blessedHouse",
          label: mapViewLabels.blessedHouse || locationLegendLabel,
          center: [mapPin.coordinates.lng, mapPin.coordinates.lat],
          zoom: 13,
        },
      ]
    : [];

  const inquiryTitle = textValue(
    copy?.inquiryTitle,
    PVG_PAGE_DEFAULTS.inquiryTitle,
    language,
    "pvg.inquiryTitle",
    t
  );
  const inquiryLead = textValue(
    copy?.inquiryLead,
    PVG_PAGE_DEFAULTS.inquiryLead,
    language,
    "pvg.inquiryLead",
    t
  );
  const inquirySubmitLabel = textValue(
    copy?.inquirySubmitLabel,
    PVG_PAGE_DEFAULTS.inquirySubmitLabel,
    language,
    "pvg.inquirySubmitLabel",
    t
  );
  const inquirySubmittingLabel = textValue(
    copy?.inquirySubmittingLabel,
    PVG_PAGE_DEFAULTS.inquirySubmittingLabel,
    language,
    "pvg.inquirySubmittingLabel",
    t
  );
  const inquirySuccessMessage = textValue(
    copy?.inquirySuccessMessage,
    PVG_PAGE_DEFAULTS.inquirySuccessMessage,
    language,
    "pvg.inquirySuccessMessage",
    t
  );

  const hostImage = copy?.hostImage?.value || PVG_PAGE_DEFAULTS.hostImage;
  const hostImageAlt =
    copy?.hostImageAlt?.value || PVG_PAGE_DEFAULTS.hostImageAlt;
  const hostQuote = textValue(
    copy?.hostQuote,
    PVG_PAGE_DEFAULTS.hostQuote,
    language,
    "pvg.hostQuote",
    t
  );
  const hostName = copy?.hostName?.value || PVG_PAGE_DEFAULTS.hostName;
  const hostRole = textValue(
    copy?.hostRole,
    PVG_PAGE_DEFAULTS.hostRole,
    language,
    "pvg.hostRole",
    t
  );

  const attendeeLabelsRaw = t("pvg.attendeeRanges");
  const attendeeLabels = Array.isArray(attendeeLabelsRaw)
    ? attendeeLabelsRaw
    : ATTENDEE_RANGE_FALLBACK;
  const attendeeUnit = pageText("attendeeUnit");

  const activeImage =
    activeImageIndex !== null ? galleryImages[activeImageIndex] : null;
  const activeImageLabel = activeImage ? resolveActivityLabel(activeImage, t, language) : "";
  const activeImageDescription = activeImage
    ? shortDescription(resolveActivityDescription(activeImage, t, language))
    : "";

  return (
    <main className={styles.page}>
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroMedia}>
          <div className={styles.heroImageWrap} ref={imageRef}>
            <img
              src={heroImage}
              alt={heroImageAlt}
              className={styles.heroImage}
            />
          </div>
          <div className={styles.heroShade} />
        </div>
        <div className={styles.heroInner}>
          <p className={styles.brandName}>{heroBrandLine}</p>
          <h1 className={styles.headline}>{heroHeadline}</h1>
          <button type="button" className={styles.cta} onClick={scrollToForm}>
            {heroCta}
          </button>
        </div>
      </section>

      <section className={styles.guarantee}>
        <div className={styles.containerNarrow}>
          <img
            src={guaranteeLogo}
            alt={heroBrandLine}
            className={styles.guaranteeLogo}
          />
          <h2>{guaranteeTitle}</h2>
          <p>{guaranteeBody}</p>
        </div>
      </section>

      <section className={styles.pillars}>
        <div className={styles.container}>
          <h2>{pillarsTitle}</h2>
          <div className={styles.pillarGrid}>
            {pillars.map((pillar) => (
              <article key={pillar.id} className={styles.pillar}>
                {pillar.image ? (
                  <img
                    src={pillar.image}
                    alt=""
                    className={styles.pillarImage}
                  />
                ) : null}
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={capacityRef}
        className={`${styles.capacity} ${
          capacityVisible ? styles.capacityVisible : ""
        }`}
      >
        <div className={styles.container}>
          <div className={styles.capacityGrid}>
            <h2 className={styles.capacityTitle}>{capacityTitle}</h2>
            <ul className={styles.specList}>
              {capacitySpecs.map((spec, index) => (
                <li key={spec.id} style={{ "--i": index }}>
                  <span className={styles.specLabel}>{spec.label}</span>
                  <span className={styles.specText}>{spec.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.location}>
        <div className={styles.containerWide}>
          <div className={styles.locationGrid}>
            <div className={styles.locationCopy}>
              <h2>{locationTitle}</h2>
              <p className={styles.locationLead}>{locationLead}</p>
              {petsTitle ? (
                <button
                  type="button"
                  className={styles.petsTrigger}
                  onClick={() => setPetsOpen(true)}
                  aria-haspopup="dialog"
                >
                  <span className={styles.petsIcon}>
                    <PawIcon />
                  </span>
                  <span>{petsTitle}</span>
                  <span className={styles.petsInfo} aria-hidden="true">
                    i
                  </span>
                </button>
              ) : null}
            </div>
            {mapPin ? (
              <div className={styles.mapWrap}>
                <ActivitiesMap
                  activities={[
                    {
                      ...mapPin,
                      title: locationLegendLabel,
                      name: locationLegendLabel,
                    },
                  ]}
                  selectedSlug={mapPin.slug}
                  showCoordinates={mapPin.coordinates}
                  fitToPins
                  showLegend={false}
                  views={mapViews}
                  initialViewId="blessedHouse"
                />
              </div>
            ) : null}
          </div>
        </div>

        {galleryImages.length > 0 ? (
          <div className={styles.galleryBlock}>
            <div className={styles.container}>
              <h3 className={styles.galleryTitle}>{activitiesTitle}</h3>
            </div>
            <div
              className={`${styles.marquee} ${
                marqueeDragging ? styles.marqueeDragging : ""
              }`}
              aria-label={activitiesTitle}
              onPointerDown={onMarqueePointerDown}
              onPointerMove={onMarqueePointerMove}
              onPointerUp={onMarqueePointerUp}
              onPointerCancel={onMarqueePointerUp}
            >
              <div className={styles.marqueeTrack} ref={trackRef}>
                {loopImages.map((image, index) => {
                  const label = resolveActivityLabel(image, t, language);
                  const isClone = index >= galleryImages.length;
                  return (
                    <button
                      type="button"
                      key={`${image.src}-${index}`}
                      className={styles.marqueeItem}
                      data-gallery-index={index}
                      tabIndex={isClone ? -1 : 0}
                      aria-hidden={isClone || undefined}
                      onClick={(event) => {
                        if (event.detail === 0) {
                          setActiveImageIndex(index % galleryImages.length);
                        }
                      }}
                    >
                      <img src={image.src} alt={label} draggable={false} />
                      <span className={styles.marqueeCaption}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className={styles.inquiry} ref={formRef} id="inquiry">
        <div className={styles.container}>
          <div className={styles.inquiryGrid}>
            <div className={styles.inquiryMain}>
              <h2>{inquiryTitle}</h2>
              <p className={styles.inquiryLead}>{inquiryLead}</p>

              {submitted ? (
                <div className={styles.successMessage} role="status">
                  <p>{inquirySuccessMessage}</p>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                  <div className={styles.honeypot} aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="organizationName">
                      <StepBadge n={1} />
                      <span>{pageText("organizationLabel")}</span>
                      <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="organizationName"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      autoComplete="organization"
                      aria-invalid={Boolean(errors.organizationName)}
                    />
                    {errors.organizationName ? (
                      <span className={styles.fieldError}>
                        {errors.organizationName}
                      </span>
                    ) : null}
                  </div>

                  <fieldset className={styles.fieldset}>
                    <legend className={styles.groupLabel}>
                      <StepBadge n={2} />
                      <span>{pageText("attendeesLabel")}</span>
                      <span className={styles.required}>*</span>
                    </legend>
                    <div className={styles.rangeCards}>
                      {ATTENDEE_RANGE_IDS.map((id, index) => {
                        const selected = formData.attendees === id;
                        return (
                          <label
                            key={id}
                            className={`${styles.rangeCard} ${
                              selected ? styles.rangeCardActive : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="attendees"
                              value={id}
                              checked={selected}
                              onChange={handleChange}
                              className={styles.srOnly}
                            />
                            <span className={styles.rangeValue}>
                              {attendeeLabels[index] ||
                                ATTENDEE_RANGE_FALLBACK[index]}
                            </span>
                            <span className={styles.rangeUnit}>
                              {attendeeUnit}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.attendees ? (
                      <span className={styles.fieldError}>
                        {errors.attendees}
                      </span>
                    ) : null}
                  </fieldset>

                  <div className={styles.dateRanges}>
                    <p className={styles.groupLabel}>
                      <StepBadge n={3} />
                      <span>{pageText("datesLabel")}</span>
                      <span className={styles.required}>*</span>
                    </p>
                    <p className={styles.dateRangesHint}>{pageText("datesHint")}</p>

                    {visibleRanges.map((range, index) => (
                      <div key={`range-${index}`} className={styles.dateRangeRow}>
                        <DateRangePicker
                          label={`${pageText("optionLabel")} ${index + 1}${
                            range.checkIn && range.checkOut
                              ? ` · ${formatRangeLabel(range, language)}`
                              : ""
                          }`}
                          checkIn={range.checkIn}
                          checkOut={range.checkOut}
                          onChange={(next) => updateRange(index, next)}
                          onClear={
                            index === 0 && rangeCount === 1
                              ? () => clearRange(0)
                              : index > 0
                                ? () => {
                                    setRanges((prev) => {
                                      const next = prev.filter((_, i) => i !== index);
                                      while (next.length < 1) {
                                        next.push({ ...EMPTY_RANGE });
                                      }
                                      return next;
                                    });
                                    setRangeCount((n) => Math.max(1, n - 1));
                                  }
                                : () => clearRange(index)
                          }
                          error={
                            index === 0 && errors.dateRanges
                              ? errors.dateRanges
                              : ""
                          }
                        />
                      </div>
                    ))}

                    {canAddAnother ? (
                      <button
                        type="button"
                        className={styles.addRangeBtn}
                        onClick={addRange}
                      >
                        {pageText("addRangeLabel")}
                      </button>
                    ) : null}
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="contactName">
                        <StepBadge n={4} />
                        <span>{pageText("contactNameLabel")}</span>
                        <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        autoComplete="name"
                        aria-invalid={Boolean(errors.contactName)}
                      />
                      {errors.contactName ? (
                        <span className={styles.fieldError}>
                          {errors.contactName}
                        </span>
                      ) : null}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="email">
                        <StepBadge n={5} />
                        <span>{pageText("emailLabel")}</span>
                        <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                      />
                      {errors.email ? (
                        <span className={styles.fieldError}>{errors.email}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className={styles.formFooter}>
                    {showFixHint ? (
                      <p className={styles.formHint} role="alert">
                        {t("pvg.fixErrors")}
                      </p>
                    ) : null}
                    {formError ? (
                      <div className={styles.errorBanner} role="alert">
                        <p>{formError}</p>
                      </div>
                    ) : null}
                    <button
                      type="submit"
                      className={styles.submit}
                      disabled={loading}
                    >
                      {loading ? inquirySubmittingLabel : inquirySubmitLabel}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <aside className={styles.hostCard}>
              {hostQuote ? (
                <blockquote className={styles.hostQuote}>
                  <p>“{hostQuote}”</p>
                  <footer>
                    <strong>{hostName}</strong>
                    {hostRole ? <span>{hostRole}</span> : null}
                  </footer>
                </blockquote>
              ) : null}
              {hostImage ? (
                <img
                  src={hostImage}
                  alt={hostImageAlt}
                  className={styles.hostImage}
                  loading="lazy"
                />
              ) : null}
            </aside>
          </div>
        </div>
      </section>

      <IctBadgeBand plain />

      {activeImage ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={closeModal}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label={activeImageLabel}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={closeModal}
              aria-label={t("pvg.galleryClose")}
            >
              ×
            </button>
            <div className={styles.modalMedia}>
              <img src={activeImage.src} alt={activeImageLabel} />
              {galleryImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    className={`${styles.modalNav} ${styles.modalPrev}`}
                    onClick={() => stepModal(-1)}
                    aria-label={t("gallery.previousImage")}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className={`${styles.modalNav} ${styles.modalNext}`}
                    onClick={() => stepModal(1)}
                    aria-label={t("gallery.nextImage")}
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>
            <div className={styles.modalBody}>
              <h3>{activeImageLabel}</h3>
              {activeImageDescription ? <p>{activeImageDescription}</p> : null}
              <span className={styles.modalCount}>
                {activeImageIndex + 1} / {galleryImages.length}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {petsOpen ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={() => setPetsOpen(false)}
        >
          <div
            className={`${styles.modal} ${styles.petsModal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pets-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setPetsOpen(false)}
              aria-label={t("pvg.galleryClose")}
            >
              ×
            </button>
            <div className={styles.petsModalBody}>
              <span className={styles.petsModalIcon}>
                <PawIcon size={26} />
              </span>
              <h3 id="pets-modal-title">{petsTitle}</h3>
              {petsNote ? <p>{petsNote}</p> : null}
              <Link
                href="/villas"
                className={styles.petsLink}
                onClick={() => setPetsOpen(false)}
              >
                {petsLinkLabel} →
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
