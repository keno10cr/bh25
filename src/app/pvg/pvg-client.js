"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useSmoothParallax } from "@/lib/parallax-motion";
import DateRangePicker, {
  formatRangeLabel,
} from "@/components/date-range-picker";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { resolveCopy } from "@/lib/cms-field";
import {
  PVG_PILLARS_DEFAULTS,
  PVG_CAPACITY_SPECS_DEFAULTS,
  PVG_PAGE_DEFAULTS,
} from "@/data/pvg-defaults";
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

function resolveActivityLabel(image, t) {
  const translated = image.translationKey
    ? t(`activitiesPage.${image.translationKey}.name`)
    : "";
  const fromTranslation =
    translated && !translated.startsWith("activitiesPage.") ? translated : "";
  const raw = fromTranslation || image.title || image.alt || "Activity";
  const lower = String(raw).toLowerCase();
  if (lower.includes("tennis") && lower.includes("negra")) {
    return "Tennis court near Playa Negra";
  }
  return raw;
}

function textValue(field, fallback, language, tKey, t) {
  return resolveCopy(field, t(tKey) || fallback, language).value;
}

export default function PvgClient({ mapPin, galleryImages = [], copy = null }) {
  const searchParams = useSearchParams();
  const { language, changeLanguage } = useLanguage();
  const t = useTranslation(language);
  const heroRef = useRef(null);
  const imageRef = useRef(null);
  const formRef = useRef(null);
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const dragState = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    baseX: 0,
  });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [ranges, setRanges] = useState([{ ...EMPTY_RANGE }]);
  const [rangeCount, setRangeCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState({});
  const [marqueeDragging, setMarqueeDragging] = useState(false);

  useEffect(() => {
    const lang = String(searchParams.get("lang") || "").toLowerCase();
    if (lang === "es" || lang === "en") {
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

      if (!dragState.current.active) {
        offsetRef.current = wrapOffset(offsetRef.current - speedPxPerSec * dt);
        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [galleryImages.length]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormError("");
  };

  const updateRange = (index, nextRange) => {
    setRanges((prev) =>
      prev.map((range, i) => (i === index ? nextRange : range))
    );
    setErrors((prev) => ({ ...prev, dateRanges: "" }));
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

    dragState.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      baseX: offsetRef.current,
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

    const nextX =
      dragState.current.baseX + (event.clientX - dragState.current.startX);
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

    dragState.current.active = false;
    dragState.current.pointerId = null;
    setMarqueeDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const validate = () => {
    const next = {};
    if (!formData.organizationName.trim()) {
      next.organizationName = "Organization name is required.";
    }
    if (!formData.attendees) {
      next.attendees = "Estimated attendees is required.";
    } else {
      const count = Number(formData.attendees);
      if (!Number.isFinite(count) || count < 20 || count > 45) {
        next.attendees = "Enter a number between 20 and 45.";
      }
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
    if (!validate()) return;

    const dateRanges = visibleRanges.filter((r) => r.checkIn && r.checkOut);

    setLoading(true);
    setFormError("");

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
  const heroSubtitle = textValue(
    copy?.heroSubtitle,
    PVG_PAGE_DEFAULTS.heroSubtitle,
    language,
    "pvg.heroSubtitle",
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
  const capacityImage =
    copy?.capacityImage?.value || PVG_PAGE_DEFAULTS.capacityImage;
  const capacityImageAlt =
    copy?.capacityImageAlt?.value || PVG_PAGE_DEFAULTS.capacityImageAlt;
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
          {heroSubtitle ? (
            <p className={styles.heroSubtitle}>{heroSubtitle}</p>
          ) : null}
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

      <section className={styles.capacity}>
        <div className={styles.container}>
          <div className={styles.capacityGrid}>
            <div className={styles.capacityCopy}>
              <h2>{capacityTitle}</h2>
              <ul className={styles.specList}>
                {capacitySpecs.map((spec) => (
                  <li key={spec.id}>
                    <strong>{spec.label}:</strong> {spec.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.capacityMedia}>
              <img
                src={capacityImage}
                alt={capacityImageAlt}
                className={styles.capacityImage}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.location}>
        <div className={styles.container}>
          <h2>{locationTitle}</h2>
          <p className={styles.locationLead}>{locationLead}</p>
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
                legendItems={[
                  { title: locationLegendLabel, color: "#0a4c3a" },
                ]}
                selectedSlug={mapPin.slug}
                showCoordinates={mapPin.coordinates}
                fitToPins
                showLegend
              />
            </div>
          ) : null}
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
                  const label = resolveActivityLabel(image, t);
                  return (
                    <div
                      key={`${image.src}-${index}`}
                      className={styles.marqueeItem}
                    >
                      <img src={image.src} alt={label} draggable={false} />
                      <p className={styles.marqueeCaption}>{label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className={styles.inquiry} ref={formRef} id="inquiry">
        <div className={styles.containerNarrow}>
          <h2>{inquiryTitle}</h2>
          <p className={styles.inquiryLead}>{inquiryLead}</p>

          {submitted ? (
            <div className={styles.successMessage} role="status">
              <p>{inquirySuccessMessage}</p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              {formError ? (
                <div className={styles.errorBanner} role="alert">
                  <p>{formError}</p>
                </div>
              ) : null}

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
                  {t("pvg.organizationLabel")}{" "}
                  <span className={styles.required}>*</span>
                </label>
                <input
                  id="organizationName"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  autoComplete="organization"
                />
                {errors.organizationName ? (
                  <span className={styles.fieldError}>
                    {errors.organizationName}
                  </span>
                ) : null}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="attendees">
                  {t("pvg.attendeesLabel")}{" "}
                  <span className={styles.required}>*</span>
                </label>
                <input
                  id="attendees"
                  name="attendees"
                  type="number"
                  min={20}
                  max={45}
                  value={formData.attendees}
                  onChange={handleChange}
                />
                {errors.attendees ? (
                  <span className={styles.fieldError}>{errors.attendees}</span>
                ) : null}
              </div>

              <div className={styles.dateRanges}>
                <p className={styles.dateRangesLabel}>
                  {t("pvg.datesLabel")}{" "}
                  <span className={styles.required}>*</span>
                </p>
                <p className={styles.dateRangesHint}>{t("pvg.datesHint")}</p>

                {visibleRanges.map((range, index) => (
                  <div key={`range-${index}`} className={styles.dateRangeRow}>
                    <DateRangePicker
                      label={`${t("pvg.optionLabel")} ${index + 1}${
                        range.checkIn && range.checkOut
                          ? ` · ${formatRangeLabel(range)}`
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
                    {t("pvg.addRangeLabel")}
                  </button>
                ) : null}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="contactName">
                    {t("pvg.contactNameLabel")}{" "}
                    <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                  {errors.contactName ? (
                    <span className={styles.fieldError}>
                      {errors.contactName}
                    </span>
                  ) : null}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">
                    {t("pvg.emailLabel")}{" "}
                    <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  {errors.email ? (
                    <span className={styles.fieldError}>{errors.email}</span>
                  ) : null}
                </div>
              </div>

              <button
                type="submit"
                className={styles.submit}
                disabled={loading}
              >
                {loading ? inquirySubmittingLabel : inquirySubmitLabel}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
