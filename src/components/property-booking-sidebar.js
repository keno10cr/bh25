"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  buildBookingQueryString,
  buildStayPricing,
  computeExtraGuestStayFee,
  withExtraGuestStayFee,
} from "@/lib/bookingPricing";
import {
  DATES_UNAVAILABLE_MESSAGE,
  occupiedNightsFromStay,
  tomorrowIsoDate,
} from "@/lib/availabilityDates";
import {
  clampGuestSelection,
  formatGuestSelectionSummary,
  getTotalHumanGuests,
  normalizeGuestSelection,
} from "@/lib/guestSelection";
import {
  extraGuestCount,
  getDefaultPublishedNightly,
  resolveBaseGuestCount,
  resolveExtraGuestFeePerNight,
  resolveMinimumNights,
} from "@/lib/propertyPricing";
import { formatCrc, usdToCrc } from "@/lib/currency";
import {
  resolveLengthOfStayDiscount,
  stayDiscountAmount,
  stayDiscountLabel,
  stayDiscountPercents,
} from "@/lib/stayDiscounts";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./property-booking-sidebar.module.css";

const CURRENCY_STORAGE_KEY = "blessedhouse-currency";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseLocalIso(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toLocalIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(iso) {
  const date = parseLocalIso(iso);
  if (!date) return "Select date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildMonthCells(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, monthIndex, day));
  }
  return cells;
}

function CalendarMonth({
  year,
  monthIndex,
  minIso,
  disabledDates,
  checkIn,
  checkOut,
  onDayClick,
}) {
  const cells = buildMonthCells(year, monthIndex);
  return (
    <div className={styles.calendarMonth}>
      <h4>
        {MONTHS[monthIndex]} {year}
      </h4>
      <div className={styles.weekdays}>
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className={styles.calendarGrid}>
        {cells.map((date, index) => {
          if (!date) {
            return <span key={`e-${index}`} className={styles.emptyDay} />;
          }
          const iso = toLocalIso(date);
          const disabled = iso < minIso || disabledDates.has(iso);
          const isStart = checkIn === iso;
          const isEnd = checkOut === iso;
          const inRange =
            checkIn && checkOut && iso > checkIn && iso < checkOut;
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              className={[
                styles.day,
                disabled ? styles.dayDisabled : "",
                inRange ? styles.dayInRange : "",
                isStart || isEnd ? styles.dayEdge : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onDayClick(iso)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function usdMoney(amount) {
  return `$${Number(amount || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export default function PropertyBookingSidebar({
  property,
  reviews = [],
  villaNumericId,
  crcBaseRate = null,
  stayDiscounts = null,
}) {
  const { language } = useLanguage();
  const [chosenCurrency, setChosenCurrency] = useState(null);
  const canShowColones = Number(crcBaseRate) > 0;
  const currency =
    canShowColones && (chosenCurrency || (language === "es" ? "CRC" : "USD")) === "CRC"
      ? "CRC"
      : "USD";
  const inColones = currency === "CRC";
  const money = inColones ? formatCrc : usdMoney;
  const toDisplay = (usd) => (inColones ? usdToCrc(usd, crcBaseRate) : usd);

  useEffect(() => {
    const saved = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved === "USD" || saved === "CRC") setChosenCurrency(saved);
  }, []);

  const chooseCurrency = (next) => {
    setChosenCurrency(next);
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, next);
  };

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState({ adults: 2, children: 0, pets: 0 });
  const [disabledDates, setDisabledDates] = useState(new Set());
  const [pricingMap, setPricingMap] = useState({});
  const [defaultNightlyRate, setDefaultNightlyRate] = useState(0);
  const [liveGuestsMax, setLiveGuestsMax] = useState(null);
  const [liveBaseGuestCount, setLiveBaseGuestCount] = useState(null);
  const [liveExtraGuestFee, setLiveExtraGuestFee] = useState(null);
  const [liveMinimumNights, setLiveMinimumNights] = useState(null);
  const [liveCleaningFee, setLiveCleaningFee] = useState(null);
  const [minIso, setMinIso] = useState(() => tomorrowIsoDate());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [openGuestsAfterDates, setOpenGuestsAfterDates] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  const petsMax = property?.petsMax || 0;
  const guestsMax =
    (typeof liveGuestsMax === "number" && liveGuestsMax > 0
      ? liveGuestsMax
      : property?.guestsMax) || 2;
  const pricingProperty = useMemo(
    () => ({
      ...property,
      guestsMax,
      capacity: guestsMax,
      baseGuestCount:
        typeof liveBaseGuestCount === "number" && liveBaseGuestCount > 0
          ? liveBaseGuestCount
          : property?.baseGuestCount,
      extraGuestFeePerNight:
        typeof liveExtraGuestFee === "number" && liveExtraGuestFee > 0
          ? liveExtraGuestFee
          : property?.extraGuestFeePerNight,
      minimumNights:
        typeof liveMinimumNights === "number" && liveMinimumNights >= 1
          ? liveMinimumNights
          : property?.minimumNights,
    }),
    [
      property,
      guestsMax,
      liveBaseGuestCount,
      liveExtraGuestFee,
      liveMinimumNights,
    ]
  );
  const minimumNights = resolveMinimumNights(pricingProperty);
  const publishedRate =
    defaultNightlyRate || getDefaultPublishedNightly(pricingProperty);

  useEffect(() => {
    if (!property?.slug) return;
    let cancelled = false;
    (async () => {
      setLoadingAvailability(true);
      try {
        const response = await fetch(`/api/availability/${property.slug}`);
        if (!response.ok) throw new Error("Availability failed");
        const data = await response.json();
        if (cancelled) return;
        setDisabledDates(new Set(data.disabledDates || []));
        setPricingMap(data.pricingMap || {});
        setDefaultNightlyRate(data.defaultNightlyRate || 0);
        if (data.minCheckInDate) setMinIso(data.minCheckInDate);
        if (typeof data.guestsMax === "number" && data.guestsMax > 0) {
          setLiveGuestsMax(data.guestsMax);
        }
        if (typeof data.baseGuestCount === "number" && data.baseGuestCount > 0) {
          setLiveBaseGuestCount(data.baseGuestCount);
        }
        if (
          typeof data.extraGuestFeePerNight === "number" &&
          data.extraGuestFeePerNight > 0
        ) {
          setLiveExtraGuestFee(data.extraGuestFeePerNight);
        }
        if (typeof data.minimumNights === "number" && data.minimumNights >= 1) {
          setLiveMinimumNights(data.minimumNights);
        }
        if (typeof data.cleaningFee === "number" && data.cleaningFee >= 0) {
          setLiveCleaningFee(data.cleaningFee);
        }
        if (typeof data.guestsMax === "number" && data.guestsMax > 0) {
          setGuests((prev) =>
            clampGuestSelection(
              normalizeGuestSelection(prev),
              data.guestsMax,
              typeof data.petsMax === "number" ? data.petsMax : petsMax
            )
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoadingAvailability(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [property?.slug, petsMax]);

  useEffect(() => {
    setGuests((prev) =>
      clampGuestSelection(normalizeGuestSelection(prev), guestsMax, petsMax)
    );
  }, [guestsMax, petsMax]);

  const nightIsos = useMemo(() => {
    if (!checkIn || !checkOut) return [];
    return occupiedNightsFromStay(checkIn, checkOut);
  }, [checkIn, checkOut]);

  const nights = nightIsos.length;
  const hasDates = nights > 0;

  const stayPricing = useMemo(() => {
    if (!nights) return null;
    const nightly = buildStayPricing(
      nightIsos,
      pricingMap,
      property?.seasonalPricing || [],
      publishedRate
    );
    const extra = computeExtraGuestStayFee({
      nights,
      extraGuests: extraGuestCount(
        getTotalHumanGuests(guests),
        pricingProperty
      ),
      feePerNight: resolveExtraGuestFeePerNight(pricingProperty),
    });
    return withExtraGuestStayFee(nightly, extra);
  }, [
    nightIsos,
    nights,
    pricingMap,
    property?.seasonalPricing,
    publishedRate,
    guests,
    pricingProperty,
  ]);

  const cleaningFeeUsd = Math.max(
    0,
    Number(liveCleaningFee ?? property?.cleaningFee) || 0
  );

  /** Colón prices convert each unit rate first, so every line matches the published ₡ rates. */
  const displayPricing = useMemo(() => {
    if (!stayPricing) return null;
    const convert = (usd) => (inColones ? usdToCrc(usd, crcBaseRate) : usd);
    const lines = stayPricing.lines.map((line) => {
      const rate = convert(line.rate);
      return { ...line, rate, subtotal: inColones ? rate * line.count : line.subtotal };
    });
    const extra = stayPricing.extraGuest;
    const extraGuest = extra
      ? {
          ...extra,
          feePerNight: convert(extra.feePerNight),
          subtotal: inColones
            ? convert(extra.feePerNight) * extra.extraGuests * extra.nights
            : extra.subtotal,
        }
      : null;
    const nightlyTotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
    const accommodation = nightlyTotal + (extraGuest?.subtotal ?? 0);
    const stayRule = resolveLengthOfStayDiscount(nights, stayDiscountPercents(stayDiscounts));
    const stayDiscount = stayRule
      ? {
          ...stayRule,
          amount: stayDiscountAmount(accommodation, stayRule.percent, inColones ? 0 : 2),
        }
      : null;
    const cleaningFee = convert(cleaningFeeUsd);
    return {
      lines,
      extraGuest,
      stayDiscount,
      cleaningFee,
      total: accommodation - (stayDiscount?.amount ?? 0) + cleaningFee,
    };
  }, [stayPricing, inColones, crcBaseRate, cleaningFeeUsd, nights, stayDiscounts]);

  const meetsMinimum = nights > 0 && nights >= minimumNights;
  const stayHitsBlockedNight =
    nightIsos.length > 0 && nightIsos.some((iso) => disabledDates.has(iso));
  const canReserve =
    Boolean(checkIn && checkOut && guests.adults > 0 && meetsMinimum && stayPricing) &&
    !stayHitsBlockedNight &&
    !loadingAvailability;

  const quotePayload = stayPricing
    ? {
        total: stayPricing.total,
        nightlySubtotal: stayPricing.nightlyTotal,
        currency: property?.currency || "USD",
        lines: stayPricing.lines,
        extraGuest: stayPricing.extraGuest || undefined,
      }
    : null;

  const bookingQuery = buildBookingQueryString({
    propertySlug: property?.slug,
    checkIn,
    checkOut,
    adults: guests.adults,
    children: guests.children,
    pets: guests.pets,
    quote: quotePayload,
  });

  const reserveHref = `/checkout?${bookingQuery}`;
  const contactParams = new URLSearchParams(bookingQuery);
  if (villaNumericId) contactParams.set("villa", String(villaNumericId));
  contactParams.set("subject", "booking");
  const contactHref = `/contact?${contactParams.toString()}`;

  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? (
          reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) /
          reviewCount
        ).toFixed(2)
      : null;

  const shiftMonth = (delta) => {
    const next = new Date(visibleMonth.year, visibleMonth.month + delta, 1);
    setVisibleMonth({ year: next.getFullYear(), month: next.getMonth() });
  };

  const secondMonth = useMemo(() => {
    const next = new Date(visibleMonth.year, visibleMonth.month + 1, 1);
    return { year: next.getFullYear(), month: next.getMonth() };
  }, [visibleMonth]);

  const handleDayClick = (iso) => {
    if (!checkIn || (checkIn && checkOut) || iso <= checkIn) {
      setCheckIn(iso);
      setCheckOut("");
      setGuestOpen(false);
      return;
    }
    const nightsInRange = occupiedNightsFromStay(checkIn, iso);
    const blocked = nightsInRange.some((night) => disabledDates.has(night));
    if (blocked) return;
    setCheckOut(iso);
  };

  const adjustGuest = (field, delta) => {
    setGuests((prev) => {
      const next = {
        ...prev,
        [field]: Math.max(0, (prev[field] || 0) + delta),
      };
      if (field === "adults" && next.adults < 1) next.adults = 1;
      return clampGuestSelection(next, guestsMax, petsMax);
    });
  };

  const discountPercents = stayDiscountPercents(stayDiscounts);
  const stayDiscountParts = [
    discountPercents.weekly > 0 ? `${discountPercents.weekly}% off 7+ nights` : "",
    discountPercents.monthly > 0 ? `${discountPercents.monthly}% off 28+ nights` : "",
  ].filter(Boolean);
  const stayDiscountHint = stayDiscountParts.length
    ? `${stayDiscountParts.join(", ")}. `
    : "";
  const baseIncluded = resolveBaseGuestCount(pricingProperty);
  const extraFee = resolveExtraGuestFeePerNight(pricingProperty);

  return (
    <aside className={styles.wrap}>
      <div className={styles.card}>
        <p className={styles.preheader}>
          {checkIn && checkOut
            ? "This price includes all fees except tax (shown at checkout)"
            : "Select dates to see pricing"}
        </p>

        <div className={styles.priceRow}>
          <div>
            {displayPricing ? (
              <>
                <span className={styles.price}>{money(displayPricing.total)}</span>
                <span className={styles.priceMeta}> for {nights} nights</span>
                {displayPricing.cleaningFee > 0 ? (
                  <span className={styles.priceNote}>Includes cleaning fee.</span>
                ) : null}
              </>
            ) : (
              <>
                <span className={styles.price}>{money(toDisplay(publishedRate))}</span>
                <span className={styles.priceMeta}> / night</span>
              </>
            )}
          </div>
          {avgRating ? (
            <div className={styles.rating}>
              ★ {avgRating}
              <span>
                {" "}
                ({reviewCount} review{reviewCount === 1 ? "" : "s"})
              </span>
            </div>
          ) : null}
        </div>

        {displayPricing ? (
          <div className={styles.breakdown}>
            {displayPricing.lines.map((line) => (
              <div key={`${line.label}-${line.rate}`}>
                {line.count} × {line.label} · {money(line.rate)} / night:{" "}
                {money(line.subtotal)}
              </div>
            ))}
            {displayPricing.extraGuest ? (
              <div>
                Extra guest fee ({displayPricing.extraGuest.extraGuests} extra ×{" "}
                {money(displayPricing.extraGuest.feePerNight)}/night): +
                {money(displayPricing.extraGuest.subtotal)}
              </div>
            ) : null}
            {displayPricing.stayDiscount ? (
              <div className={styles.discountLine}>
                {stayDiscountLabel(displayPricing.stayDiscount)}: −
                {money(displayPricing.stayDiscount.amount)}
              </div>
            ) : null}
          </div>
        ) : (
          <p className={styles.hint}>
            Rate includes {baseIncluded} guest{baseIncluded === 1 ? "" : "s"}
            {extraFee > 0
              ? `. Extra guests ${money(toDisplay(extraFee))} / person / night.`
              : "."}{" "}
            {cleaningFeeUsd > 0 ? "Cleaning is included in your stay total. " : ""}
            {stayDiscountHint}
            Minimum stay {minimumNights} night{minimumNights === 1 ? "" : "s"} for
            booking requests.
          </p>
        )}

        <div className={styles.fields}>
          <button
            type="button"
            className={styles.dateField}
            onClick={() => setCalendarOpen(true)}
          >
            <span>Check in</span>
            <strong>{formatDisplayDate(checkIn)}</strong>
          </button>
          <button
            type="button"
            className={styles.dateField}
            onClick={() => setCalendarOpen(true)}
          >
            <span>Check out</span>
            <strong>{formatDisplayDate(checkOut)}</strong>
          </button>
        </div>

        <div className={styles.guestWrap}>
          <button
            type="button"
            className={`${styles.guestField} ${hasDates ? "" : styles.guestFieldLocked}`}
            aria-describedby={hasDates ? undefined : "guest-dates-first"}
            onClick={() => {
              if (!hasDates) {
                setOpenGuestsAfterDates(true);
                setCalendarOpen(true);
                return;
              }
              setGuestOpen((open) => !open);
            }}
          >
            <span>Guests</span>
            <strong>
              {hasDates ? formatGuestSelectionSummary(guests) : "Select dates first"}
            </strong>
          </button>
          {!hasDates ? (
            <p id="guest-dates-first" className={styles.guestLockHint}>
              Choose your dates first, then set guests so the price is exact.
            </p>
          ) : null}
          {guestOpen && hasDates ? (
            <div className={styles.guestPanel}>
              {[
                { key: "adults", label: "Adults" },
                { key: "children", label: "Children" },
                ...(petsMax > 0 ? [{ key: "pets", label: "Pets" }] : []),
              ].map((row) => (
                <div key={row.key} className={styles.guestRow}>
                  <span>{row.label}</span>
                  <div className={styles.guestControls}>
                    <button
                      type="button"
                      onClick={() => adjustGuest(row.key, -1)}
                      aria-label={`Fewer ${row.label}`}
                    >
                      −
                    </button>
                    <strong>{guests[row.key]}</strong>
                    <button
                      type="button"
                      onClick={() => adjustGuest(row.key, 1)}
                      aria-label={`More ${row.label}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              {displayPricing ? (
                <p className={styles.guestLiveTotal} aria-live="polite">
                  {money(displayPricing.total)} for {nights} night{nights === 1 ? "" : "s"}
                  {displayPricing.extraGuest
                    ? ` (includes ${displayPricing.extraGuest.extraGuests} extra guest${
                        displayPricing.extraGuest.extraGuests === 1 ? "" : "s"
                      })`
                    : ""}
                </p>
              ) : null}
              <div className={styles.guestFooter}>
                <p className={styles.guestCap}>Up to {guestsMax} guests</p>
                <button
                  type="button"
                  className={styles.guestOk}
                  onClick={() => setGuestOpen(false)}
                >
                  OK
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {stayHitsBlockedNight ? (
          <p className={styles.warning}>{DATES_UNAVAILABLE_MESSAGE}</p>
        ) : null}

        {nights > 0 && !meetsMinimum ? (
          <p className={styles.warning}>
            Minimum stay is {minimumNights} nights.{" "}
            <Link href={contactHref}>Contact us</Link> for shorter stays.
          </p>
        ) : null}

        {canReserve ? (
          <Link className={styles.primaryBtn} href={reserveHref}>
            Request Booking
          </Link>
        ) : (
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => setCalendarOpen(true)}
            disabled={loadingAvailability}
          >
            {checkIn && checkOut ? "Check availability" : "Check availability"}
          </button>
        )}

        {canShowColones ? (
          <div className={styles.currencyToggle}>
            <div role="radiogroup" aria-label="Currency" className={styles.currencyOptions}>
              {[
                { value: "USD", label: "USD ($)" },
                { value: "CRC", label: "CRC (₡)" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={currency === option.value}
                  className={currency === option.value ? styles.currencyActive : ""}
                  onClick={() => chooseCurrency(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {inColones ? (
              <p className={styles.currencyNote}>
                Colones are for reference. Payment is processed in USD at checkout.
              </p>
            ) : null}
          </div>
        ) : null}

        {canReserve ? (
          <p className={styles.noCharge}>
            Our team confirms availability before any payment
          </p>
        ) : null}
      </div>

      <ul className={styles.trust}>
        <li>
          <strong>Personalized confirmation</strong>
          <span>Our team reviews every stay request before confirmation.</span>
        </li>
        <li>
          <strong>Dedicated support</strong>
          <span>WhatsApp, phone, or email support throughout the process.</span>
        </li>
        <li>
          <strong>Professional team</strong>
          <span>Pristine pre arrival preparation before every stay.</span>
        </li>
        <li>
          <strong>Secure check in</strong>
          <span>Coordinated access and arrival support.</span>
        </li>
      </ul>

      {calendarOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Select dates</h3>
              <button
                type="button"
                onClick={() => {
                  setCalendarOpen(false);
                  setOpenGuestsAfterDates(false);
                }}
              >
                Close
              </button>
            </div>
            <div className={styles.months}>
              <CalendarMonth
                year={visibleMonth.year}
                monthIndex={visibleMonth.month}
                minIso={minIso}
                disabledDates={disabledDates}
                checkIn={checkIn}
                checkOut={checkOut}
                onDayClick={handleDayClick}
              />
              <CalendarMonth
                year={secondMonth.year}
                monthIndex={secondMonth.month}
                minIso={minIso}
                disabledDates={disabledDates}
                checkIn={checkIn}
                checkOut={checkOut}
                onDayClick={handleDayClick}
              />
            </div>
            <div className={styles.modalFooter}>
              <button type="button" onClick={() => shiftMonth(-1)}>
                Previous
              </button>
              <button
                type="button"
                className={styles.confirmDates}
                disabled={!checkOut}
                onClick={() => {
                  setCalendarOpen(false);
                  if (openGuestsAfterDates) setGuestOpen(true);
                  setOpenGuestsAfterDates(false);
                }}
              >
                Confirm
              </button>
              <button type="button" onClick={() => shiftMonth(1)}>
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
