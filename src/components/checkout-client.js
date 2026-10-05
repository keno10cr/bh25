"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PortableBody from "@/components/portable-text";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  buildCheckoutPriceSummary,
  formatMoney,
  formatStayDate,
  getOrderedHouseRuleCards,
} from "@/lib/checkout";
import { resolveFeeTitle } from "@/lib/checkoutFees";
import {
  clampGuestSelection,
  formatGuestSelectionSummary,
  getTotalHumanGuests,
  normalizeGuestSelection,
} from "@/lib/guestSelection";
import { computeExtraGuestStayFee } from "@/lib/bookingPricing";
import {
  extraGuestCount,
  getDefaultPublishedNightly,
  resolveExtraGuestFeePerNight,
  resolveMinimumNights,
} from "@/lib/propertyPricing";
import { occupiedNightsFromStay } from "@/lib/availabilityDates";
import { useTranslation } from "@/lib/translations";
import styles from "./checkout.module.css";

function interpolate(template, values = {}) {
  return String(template || "").replace(/\{(\w+)\}/g, (_, key) =>
    values[key] != null ? String(values[key]) : `{${key}}`
  );
}

function formatFeeLineLabel(fee, language, money) {
  const title = resolveFeeTitle(fee, language);
  if (fee.feeType === "percentage") {
    return `${title} (${fee.amount}%)`;
  }
  if (fee.application === "perNight") {
    return `${title} (${money(fee.amount)} / night)`;
  }
  return title;
}

const TOTAL_STEPS = 2;

export default function CheckoutClient({
  property,
  settings,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  initialQuote,
}) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [currentStep, setCurrentStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const guests = useMemo(
    () =>
      clampGuestSelection(
        normalizeGuestSelection(initialGuests),
        property.guestsMax || 2,
        property.petsMax || 0
      ),
    [initialGuests, property.guestsMax, property.petsMax]
  );

  const nightIsos = useMemo(
    () =>
      initialCheckIn && initialCheckOut
        ? occupiedNightsFromStay(initialCheckIn, initialCheckOut)
        : [],
    [initialCheckIn, initialCheckOut]
  );
  const nights = nightIsos.length;
  const guestSummary = formatGuestSelectionSummary(guests);
  const minimumNights = resolveMinimumNights(property);
  const belowMinimumStay = nights > 0 && nights < minimumNights;

  const extraGuestFee = useMemo(
    () =>
      computeExtraGuestStayFee({
        nights,
        extraGuests: extraGuestCount(getTotalHumanGuests(guests), property),
        feePerNight: resolveExtraGuestFeePerNight(property),
      }),
    [nights, guests, property]
  );

  const priceSummary = useMemo(() => {
    const fallbackNightly = getDefaultPublishedNightly(property);
    const quotedNightly =
      typeof initialQuote?.nightlySubtotal === "number"
        ? initialQuote.nightlySubtotal
        : typeof initialQuote?.total === "number"
          ? initialQuote.total - (initialQuote.extraGuest?.subtotal ?? 0)
          : undefined;
    const nightlySubtotal =
      typeof quotedNightly === "number" && Number.isFinite(quotedNightly)
        ? quotedNightly
        : fallbackNightly * Math.max(0, nights);
    const extraSubtotal = extraGuestFee?.subtotal ?? 0;
    const subtotalOverride = nightlySubtotal + extraSubtotal;
    const nightlyRate =
      nights > 0
        ? Math.round((nightlySubtotal / Math.max(1, nights)) * 100) / 100
        : fallbackNightly;

    return buildCheckoutPriceSummary({
      currency: initialQuote?.currency || property.currency || "USD",
      nights,
      nightlyRate,
      subtotalOverride,
      taxRate: settings.taxRate,
      settings,
    });
  }, [extraGuestFee, initialQuote, nights, property, settings]);

  const houseRuleCards = useMemo(
    () => getOrderedHouseRuleCards(property, t),
    [property, t]
  );

  const locationLabel = [property.locationLabel, property.regionEn]
    .filter(Boolean)
    .join(", ");

  const isGuestInfoValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    /^\S+@\S+\.\S+$/.test(email.trim()) &&
    phone.trim().length >= 8 &&
    guests.adults > 0 &&
    nights > 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, success]);

  const propertyHref = `/villas/${property.slug}`;

  const handleBack = () => {
    if (success || currentStep === 1) {
      router.push(propertyHref);
      return;
    }
    setCurrentStep((step) => step - 1);
  };

  const handlePrimaryAction = async () => {
    if (success) {
      router.push(propertyHref);
      return;
    }
    if (belowMinimumStay) return;
    if (currentStep === 1) {
      if (!isGuestInfoValid) return;
      setCurrentStep(2);
      return;
    }
    if (!termsAccepted || submitting) return;

    setSubmitting(true);
    setSubmitError("");

    const nightlyPortion = extraGuestFee
      ? priceSummary.subtotal - extraGuestFee.subtotal
      : priceSummary.subtotal;

    const pricing = {
      currency: priceSummary.currency,
      nightlySubtotal: nightlyPortion,
      extraGuestFees: extraGuestFee?.subtotal ?? 0,
      feeLines: (priceSummary.feeLines || []).map((line) => ({
        feeId: line.feeId,
        title: resolveFeeTitle(line, language),
        feeType: line.feeType,
        amount: line.amount,
        application: line.application,
        subtotal: line.subtotal,
      })),
      feesTotal: priceSummary.feesTotal,
      serviceFee: priceSummary.feesTotal,
      tax: priceSummary.taxes,
      total: priceSummary.total,
    };

    try {
      const response = await fetch("/api/bookings/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          checkIn: initialCheckIn,
          checkOut: initialCheckOut,
          guestName: `${firstName.trim()} ${lastName.trim()}`.trim(),
          guestEmail: email.trim(),
          guestPhone: phone.trim(),
          guestCount: getTotalHumanGuests(guests),
          petsCount: guests.pets || 0,
          nights,
          pricing,
          paymentProvider: "none",
          language,
          source: "web",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("checkout.submitError"));
      }

      setConfirmationCode(data.confirmationCode || "");
      setSuccess(true);
    } catch (error) {
      setSubmitError(error.message || t("checkout.submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const primaryDisabled = success
    ? false
    : submitting
      ? true
      : belowMinimumStay
        ? true
        : currentStep === 1
          ? !isGuestInfoValid
          : !termsAccepted;

  const primaryLabel = success
    ? t("checkout.ok")
    : submitting
      ? t("checkout.submitting")
      : currentStep === TOTAL_STEPS
        ? t("checkout.sendRequest")
        : t("checkout.continue");

  const money = (amount) => formatMoney(amount, priceSummary.currency);
  const heroSrc =
    property.heroImage ||
    (Array.isArray(property.gallery) && property.gallery[0]) ||
    "";

  return (
    <div className={styles.pageShell}>
      <div className={styles.topBar}>
        <button type="button" className={styles.backButton} onClick={handleBack}>
          ← {t("checkout.back")}
        </button>
        {!success ? (
          <div
            className={styles.progressWrap}
            aria-label={interpolate(t("checkout.stepOf"), {
              current: currentStep,
              total: TOTAL_STEPS,
            })}
          >
            <p className={styles.progressLabel}>
              {interpolate(t("checkout.stepOf"), {
                current: currentStep,
                total: TOTAL_STEPS,
              })}
            </p>
            <div className={styles.progressTrack}>
              <span
                className={styles.progressFill}
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div />
        )}
        <div className={styles.topBarSpacer} />
      </div>

      <div className={styles.layout}>
        <main className={styles.mainColumn}>
          {!success && belowMinimumStay ? (
            <div className={styles.minStayBanner} role="alert">
              {interpolate(t("checkout.minStayBanner"), {
                nights: minimumNights,
              })}
            </div>
          ) : null}

          {success ? (
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelIcon} aria-hidden>
                  ✓
                </div>
                <div>
                  <h1 className={styles.panelTitle}>{t("checkout.thankYouTitle")}</h1>
                  <p className={styles.panelSubtitle}>
                    {interpolate(t("checkout.thankYouBody"), { email })}
                  </p>
                </div>
              </div>
              <div className={styles.successSummary}>
                {confirmationCode ? (
                  <div className={styles.successRow}>
                    <span>{t("checkout.confirmationCode")}</span>
                    <strong>{confirmationCode}</strong>
                  </div>
                ) : null}
                <div className={styles.successRow}>
                  <span>{property.name}</span>
                  <strong>{money(priceSummary.total)}</strong>
                </div>
                <div className={styles.successRow}>
                  <span>{t("checkout.guests")}</span>
                  <span>{guestSummary || t("checkout.pending")}</span>
                </div>
                <div className={styles.successRow}>
                  <span>{t("checkout.dates")}</span>
                  <span>
                    {initialCheckIn && initialCheckOut
                      ? `${formatStayDate(initialCheckIn)} to ${formatStayDate(initialCheckOut)}`
                      : t("checkout.datesPending")}
                  </span>
                </div>
              </div>

              <div className={styles.successCardsSection}>
                <div className={styles.successCardsHeader}>
                  <h2 className={styles.successCardsTitle}>
                    {t("checkout.exploreTitle")}
                  </h2>
                  <p className={styles.successCardsSubtitle}>
                    {t("checkout.exploreSubtitle")}
                  </p>
                </div>
                <div className={styles.successCardsGrid}>
                  <Link href="/gallery" className={styles.successCard}>
                    <span className={styles.successCardIcon} aria-hidden>
                      📷
                    </span>
                    <strong>{t("checkout.cardGalleryTitle")}</strong>
                    <p>{t("checkout.cardGalleryDescription")}</p>
                  </Link>
                  <Link href="/activities" className={styles.successCard}>
                    <span className={styles.successCardIcon} aria-hidden>
                      🌿
                    </span>
                    <strong>{t("checkout.cardActivitiesTitle")}</strong>
                    <p>{t("checkout.cardActivitiesDescription")}</p>
                  </Link>
                  <Link href="/contact" className={styles.successCard}>
                    <span className={styles.successCardIcon} aria-hidden>
                      ✉️
                    </span>
                    <strong>{t("checkout.cardContactTitle")}</strong>
                    <p>{t("checkout.cardContactDescription")}</p>
                  </Link>
                </div>
              </div>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={handlePrimaryAction}
              >
                {primaryLabel}
              </button>
            </section>
          ) : (
            <section className={styles.panel}>
              {currentStep === 1 ? (
                <>
                  <div className={styles.panelHeader}>
                    <div className={styles.panelIcon} aria-hidden>
                      1
                    </div>
                    <div>
                      <h1 className={styles.panelTitle}>{t("checkout.guestInfoTitle")}</h1>
                      <p className={styles.panelSubtitle}>
                        {t("checkout.guestInfoSubtitle")}
                      </p>
                    </div>
                  </div>
                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>{t("checkout.firstName")}</span>
                      <input
                        className={styles.input}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        autoComplete="given-name"
                      />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>{t("checkout.lastName")}</span>
                      <input
                        className={styles.input}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        autoComplete="family-name"
                      />
                    </label>
                    <label className={`${styles.field} ${styles.fieldFull}`}>
                      <span className={styles.fieldLabel}>{t("checkout.email")}</span>
                      <input
                        className={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        inputMode="email"
                        placeholder="you@example.com"
                      />
                    </label>
                    <label className={`${styles.field} ${styles.fieldFull}`}>
                      <span className={styles.fieldLabel}>{t("checkout.phone")}</span>
                      <input
                        className={styles.input}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="+506 8888 8888"
                      />
                    </label>
                  </div>
                </>
              ) : null}

              {currentStep === 2 ? (
                <>
                  <div className={styles.panelHeader}>
                    <div className={styles.panelIcon} aria-hidden>
                      2
                    </div>
                    <div>
                      <h1 className={styles.panelTitle}>{t("checkout.houseRulesTitle")}</h1>
                      <p className={styles.panelSubtitle}>
                        {t("checkout.houseRulesSubtitle")}
                      </p>
                    </div>
                  </div>
                  <div className={styles.rulesStack}>
                    {houseRuleCards.map((rule) => (
                      <section key={rule.key} className={styles.ruleCard}>
                        <h2 className={styles.ruleTitle}>{rule.title}</h2>
                        <div className={styles.ruleBody}>
                          <PortableBody value={rule.body} />
                        </div>
                      </section>
                    ))}
                    <label className={styles.checkboxCard}>
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                      />
                      <span>{t("checkout.termsAccept")}</span>
                    </label>
                    <div className={styles.requestNote}>
                      <p>{t("checkout.requestNote")}</p>
                    </div>
                  </div>
                </>
              ) : null}

              {submitError ? (
                <div className={styles.submitError} role="alert">
                  {submitError}
                </div>
              ) : null}

              <div className={styles.desktopActions}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={primaryDisabled}
                  onClick={handlePrimaryAction}
                >
                  {primaryLabel}
                </button>
              </div>
            </section>
          )}
        </main>

        <aside className={styles.sidebarColumn}>
          <div className={styles.sidebarCard}>
            <div className={styles.propertyRow}>
              {heroSrc ? (
                <div className={styles.propertyImageWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroSrc} alt={property.name} />
                </div>
              ) : null}
              <div className={styles.propertyCopy}>
                <h2 className={styles.propertyTitle}>{property.name}</h2>
                {locationLabel ? (
                  <p className={styles.propertyLocation}>{locationLabel}</p>
                ) : null}
                <Link href={propertyHref} className={styles.propertyLink}>
                  {t("checkout.viewProperty")}
                </Link>
              </div>
            </div>

            <div className={styles.summaryGrid}>
              <div>
                <span className={styles.summaryLabel}>{t("checkout.checkIn")}</span>
                <strong>{formatStayDate(initialCheckIn) || t("checkout.pending")}</strong>
              </div>
              <div>
                <span className={styles.summaryLabel}>{t("checkout.checkOut")}</span>
                <strong>{formatStayDate(initialCheckOut) || t("checkout.pending")}</strong>
              </div>
              <div className={styles.summaryFull}>
                <span className={styles.summaryLabel}>{t("checkout.guests")}</span>
                <strong>{guestSummary || t("checkout.pending")}</strong>
              </div>
            </div>

            <div className={styles.priceCard}>
              <h3 className={styles.priceTitle}>{t("checkout.priceSummary")}</h3>
              <div className={styles.priceLine}>
                <span>
                  {t("checkout.staySubtotal")}
                  {priceSummary.nights > 0
                    ? ` (${priceSummary.nights} ${
                        priceSummary.nights === 1
                          ? t("checkout.nightSingular")
                          : t("checkout.nightPlural")
                      })`
                    : ""}
                </span>
                <span>
                  {money(
                    extraGuestFee
                      ? priceSummary.subtotal - extraGuestFee.subtotal
                      : priceSummary.subtotal
                  )}
                </span>
              </div>
              {extraGuestFee ? (
                <div className={styles.priceLine}>
                  <span>
                    {interpolate(t("checkout.extraGuestFee"), {
                      count: extraGuestFee.extraGuests,
                      rate: money(extraGuestFee.feePerNight),
                    })}
                  </span>
                  <span>{money(extraGuestFee.subtotal)}</span>
                </div>
              ) : null}
              {(priceSummary.feeLines || []).map((fee) => (
                <div key={fee.feeId || fee.titleEn} className={styles.priceLine}>
                  <span>{formatFeeLineLabel(fee, language, money)}</span>
                  <span>{money(fee.subtotal)}</span>
                </div>
              ))}
              <div className={styles.priceLine}>
                <span>
                  {settings.taxLabelEn} ({settings.taxRate}%)
                </span>
                <span>{money(priceSummary.taxes)}</span>
              </div>
              <div className={`${styles.priceLine} ${styles.priceTotal}`}>
                <span>{t("checkout.total")}</span>
                <strong>{money(priceSummary.total)}</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {!success ? (
        <div className={styles.mobileStickyBar}>
          <div>
            <span className={styles.mobileStickyLabel}>{t("checkout.total")}</span>
            <strong className={styles.mobileStickyValue}>
              {money(priceSummary.total)}
            </strong>
          </div>
          <button
            type="button"
            className={styles.mobileStickyButton}
            disabled={primaryDisabled}
            onClick={handlePrimaryAction}
          >
            {primaryLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
