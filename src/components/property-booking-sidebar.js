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
import styles from "./property-booking-sidebar.module.css";

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

function money(amount) {
  return `$${Number(amount || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export default function PropertyBookingSidebar({
  property,
  reviews = [],
  villaNumericId,
}) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState({ adults: 2, children: 0, pets: 0 });
  const [disabledDates, setDisabledDates] = useState(new Set());
  const [pricingMap, setPricingMap] = useState({});
  const [defaultNightlyRate, setDefaultNightlyRate] = useState(0);
  const [minIso, setMinIso] = useState(() => tomorrowIsoDate());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  const guestsMax = property?.guestsMax || 2;
  const petsMax = property?.petsMax || 0;
  const minimumNights = resolveMinimumNights(property || {});
  const publishedRate =
    defaultNightlyRate || getDefaultPublishedNightly(property || {});

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
      extraGuests: extraGuestCount(getTotalHumanGuests(guests), {
        ...property,
        guestsMax,
        capacity: guestsMax,
      }),
      feePerNight: resolveExtraGuestFeePerNight(property || {}),
    });
    return withExtraGuestStayFee(nightly, extra);
  }, [nightIsos, nights, pricingMap, property, publishedRate, guests, guestsMax]);

  const meetsMinimum = nights > 0 && nights >= minimumNights;
  const canReserve =
    Boolean(checkIn && checkOut && guests.adults > 0 && meetsMinimum && stayPricing);

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
  const inquireParams = new URLSearchParams(bookingQuery);
  if (villaNumericId) inquireParams.set("villa", String(villaNumericId));
  inquireParams.set("subject", "booking");
  const inquireHref = `/contact?${inquireParams.toString()}`;

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
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(iso);
      setCheckOut("");
      return;
    }
    if (iso <= checkIn) {
      setCheckIn(iso);
      setCheckOut("");
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

  const baseIncluded = resolveBaseGuestCount({
    ...property,
    guestsMax,
    capacity: guestsMax,
  });
  const extraFee = resolveExtraGuestFeePerNight(property || {});

  return (
    <aside className={styles.wrap}>
      <div className={styles.card}>
        <p className={styles.preheader}>
          {checkIn && checkOut
            ? "This price includes all fees except tax and service fee (shown at checkout)"
            : "Select dates to see pricing"}
        </p>

        <div className={styles.priceRow}>
          <div>
            {stayPricing ? (
              <>
                <span className={styles.price}>{money(stayPricing.total)}</span>
                <span className={styles.priceMeta}> for {nights} nights</span>
              </>
            ) : (
              <>
                <span className={styles.price}>{money(publishedRate)}</span>
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

        {stayPricing ? (
          <div className={styles.breakdown}>
            {stayPricing.lines.map((line) => (
              <div key={`${line.label}-${line.rate}`}>
                {line.count} × {line.label} · {money(line.rate)} / night:{" "}
                {money(line.subtotal)}
              </div>
            ))}
            {stayPricing.extraGuest ? (
              <div>
                Extra guest fee ({stayPricing.extraGuest.extraGuests} extra ×{" "}
                {money(stayPricing.extraGuest.feePerNight)}/night): +
                {money(stayPricing.extraGuest.subtotal)}
              </div>
            ) : null}
          </div>
        ) : (
          <p className={styles.hint}>
            Rate includes {baseIncluded} guest{baseIncluded === 1 ? "" : "s"}
            {extraFee > 0
              ? `. Extra guests ${money(extraFee)} / person / night.`
              : "."}{" "}
            Minimum stay {minimumNights} night{minimumNights === 1 ? "" : "s"} for
            Reserve.
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
            className={styles.guestField}
            onClick={() => setGuestOpen((open) => !open)}
          >
            <span>Guests</span>
            <strong>{formatGuestSelectionSummary(guests)}</strong>
          </button>
          {guestOpen ? (
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

        {nights > 0 && !meetsMinimum ? (
          <p className={styles.warning}>
            Minimum stay is {minimumNights} nights. You can still Inquire for a
            shorter stay.
          </p>
        ) : null}

        {canReserve ? (
          <Link className={styles.primaryBtn} href={reserveHref}>
            Reserve
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

        {canReserve ? (
          <p className={styles.noCharge}>You will not be charged yet</p>
        ) : null}

        <Link className={styles.secondaryBtn} href={inquireHref}>
          Inquire
        </Link>
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
              <button type="button" onClick={() => setCalendarOpen(false)}>
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
                onClick={() => setCalendarOpen(false)}
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
