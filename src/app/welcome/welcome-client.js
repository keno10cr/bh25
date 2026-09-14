"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useSmoothParallax } from "@/lib/parallax-motion";
import DateRangePicker, {
  formatRangeLabel,
} from "@/components/date-range-picker";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import styles from "./welcome.module.css";

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

const PILLARS = [
  {
    title: "Privacy & Security",
    body: "Full property isolation for strategic planning, confidential discussions, or private team bonding.",
  },
  {
    title: "Environment for Alignment",
    body: "High speed internet, collaborative open air spaces, and quiet rainforest surroundings.",
  },
  {
    title: "Turnkey Hospitality",
    body: "Custom meal plans, airport transfers, and local excursion coordination included.",
  },
];

export default function WelcomeClient({
  mapPin,
  galleryImages = [],
}) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const heroRef = useRef(null);
  const imageRef = useRef(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [ranges, setRanges] = useState([{ ...EMPTY_RANGE }]);
  const [rangeCount, setRangeCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState({});

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

  return (
    <main className={styles.page}>
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroMedia}>
          <div className={styles.heroImageWrap} ref={imageRef}>
            <img
              src="/BannerVilla4.jpg"
              alt="Blessed House villas in the Puerto Viejo rainforest"
              className={styles.heroImage}
            />
          </div>
          <div className={styles.heroShade} />
        </div>
        <div className={styles.heroInner}>
          <p className={styles.brandName}>Blessed House</p>
          <h1 className={styles.headline}>
            Exclusive Private Estate Buyouts for Leadership, Teams & High
            Performance Groups
          </h1>
          <button type="button" className={styles.cta} onClick={scrollToForm}>
            Send a request
          </button>
        </div>
      </section>

      <section className={styles.guarantee}>
        <div className={styles.containerNarrow}>
          <Image
            src="/blessedhouse_logo25.png"
            alt="Blessed House"
            width={160}
            height={160}
            className={styles.guaranteeLogo}
            priority
          />
          <h2>The Single Group Guarantee</h2>
          <p>
            Your group gets 100% of the estate: villas, pool, open air
            workspaces, and communal dining. No shared spaces with outside hotel
            guests.
          </p>
        </div>
      </section>

      <section className={styles.pillars}>
        <div className={styles.container}>
          <h2>Built for focus, deep work, and team alignment</h2>
          <div className={styles.pillarGrid}>
            {PILLARS.map((pillar) => (
              <article key={pillar.title} className={styles.pillar}>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.capacity}>
        <div className={styles.container}>
          <h2>Capacity & Settings</h2>
          <ul className={styles.specList}>
            <li>
              <strong>Total occupancy:</strong> 20 to 45 guests across private
              villas
            </li>
            <li>
              <strong>Amenities:</strong> Pool, dedicated gathering spaces,
              nature trails, proximity to Caribbean beaches
            </li>
            <li>
              <strong>Location:</strong> Puerto Viejo, Limón, Costa Rica
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.location}>
        <div className={styles.container}>
          <h2>Location</h2>
          <p className={styles.locationLead}>
            Puerto Viejo, Limón, Costa Rica. One private compound in the
            Caribbean rainforest.
          </p>
          {mapPin ? (
            <div className={styles.mapWrap}>
              <ActivitiesMap
                activities={[mapPin]}
                legendItems={[{ title: "Blessed House", color: "#0a4c3a" }]}
                selectedSlug={mapPin.slug}
                fitToPins
                showLegend
              />
            </div>
          ) : null}
        </div>
        {galleryImages.length > 0 ? (
          <div className={styles.marquee} aria-label="Activity gallery">
            <div className={styles.marqueeTrack}>
              {[...galleryImages, ...galleryImages].map((image, index) => {
                const translated =
                  image.translationKey
                    ? t(`activitiesPage.${image.translationKey}.name`)
                    : "";
                const label =
                  (translated &&
                    !translated.startsWith("activitiesPage.") &&
                    translated) ||
                  image.title ||
                  image.alt ||
                  "Activity";
                return (
                  <div
                    key={`${image.src}-${index}`}
                    className={styles.marqueeItem}
                  >
                    <img src={image.src} alt={label} />
                    <p className={styles.marqueeCaption}>{label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      <section className={styles.inquiry} ref={formRef} id="inquiry">
        <div className={styles.containerNarrow}>
          <h2>Send a request</h2>
          <p className={styles.inquiryLead}>
            Tell us who is coming and your preferred date options. We will reply
            with next steps.
          </p>

          {submitted ? (
            <div className={styles.successMessage} role="status">
              <p>
                Thank you. Your request is in. We will follow up by email
                shortly.
              </p>
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
                  Organization Name <span className={styles.required}>*</span>
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
                  Estimated Attendees (20 to 45){" "}
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
                  Target dates <span className={styles.required}>*</span>
                </p>
                <p className={styles.dateRangesHint}>
                  Pick up to 3 preferred ranges. Add another after you confirm
                  the current one.
                </p>

                {visibleRanges.map((range, index) => (
                  <div key={`range-${index}`} className={styles.dateRangeRow}>
                    <DateRangePicker
                      label={`Option ${index + 1}${
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
                    Add another date range
                  </button>
                ) : null}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="contactName">
                    Your Name <span className={styles.required}>*</span>
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
                    Contact email <span className={styles.required}>*</span>
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
                {loading ? "Sending..." : "Send request"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
