"use client";

import { useMemo, useState } from "react";
import { tomorrowIsoDate } from "@/lib/availabilityDates";
import styles from "./date-range-picker.module.css";

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

function shiftMonth(year, month, delta) {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

function CalendarMonth({
  year,
  monthIndex,
  minIso,
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
          const disabled = iso < minIso;
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

export function formatRangeLabel(range) {
  if (!range?.checkIn || !range?.checkOut) return "";
  return `${formatDisplayDate(range.checkIn)} to ${formatDisplayDate(range.checkOut)}`;
}

export default function DateRangePicker({
  label = "Date range",
  checkIn,
  checkOut,
  onChange,
  onClear,
  minIso: minIsoProp,
  error,
}) {
  const minIso = minIsoProp || tomorrowIsoDate();
  const [open, setOpen] = useState(false);
  const [draftIn, setDraftIn] = useState(checkIn || "");
  const [draftOut, setDraftOut] = useState(checkOut || "");
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const d = parseLocalIso(checkIn) || new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const nextMonth = useMemo(
    () => shiftMonth(visibleMonth.year, visibleMonth.month, 1),
    [visibleMonth]
  );

  const openModal = () => {
    setDraftIn(checkIn || "");
    setDraftOut(checkOut || "");
    const base = parseLocalIso(checkIn) || new Date();
    setVisibleMonth({ year: base.getFullYear(), month: base.getMonth() });
    setOpen(true);
  };

  const handleDayClick = (iso) => {
    if (!draftIn || (draftIn && draftOut)) {
      setDraftIn(iso);
      setDraftOut("");
      return;
    }
    if (iso <= draftIn) {
      setDraftIn(iso);
      setDraftOut("");
      return;
    }
    setDraftOut(iso);
  };

  const confirm = () => {
    if (!draftIn || !draftOut) return;
    onChange({ checkIn: draftIn, checkOut: draftOut });
    setOpen(false);
  };

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>{label}</span>
      <div className={styles.fields}>
        <button type="button" className={styles.dateBtn} onClick={openModal}>
          <span>Check in</span>
          <strong>{formatDisplayDate(checkIn)}</strong>
        </button>
        <button type="button" className={styles.dateBtn} onClick={openModal}>
          <span>Check out</span>
          <strong>{formatDisplayDate(checkOut)}</strong>
        </button>
      </div>
      {checkIn && checkOut && onClear ? (
        <button type="button" className={styles.clearBtn} onClick={onClear}>
          Clear this range
        </button>
      ) : null}
      {error ? <span className={styles.error}>{error}</span> : null}

      {open ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Select dates</h3>
              <button type="button" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <div className={styles.months}>
              <CalendarMonth
                year={visibleMonth.year}
                monthIndex={visibleMonth.month}
                minIso={minIso}
                checkIn={draftIn}
                checkOut={draftOut}
                onDayClick={handleDayClick}
              />
              <CalendarMonth
                year={nextMonth.year}
                monthIndex={nextMonth.month}
                minIso={minIso}
                checkIn={draftIn}
                checkOut={draftOut}
                onDayClick={handleDayClick}
              />
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() =>
                  setVisibleMonth((prev) =>
                    shiftMonth(prev.year, prev.month, -1)
                  )
                }
              >
                Previous
              </button>
              <button
                type="button"
                className={styles.confirmDates}
                disabled={!draftIn || !draftOut}
                onClick={confirm}
              >
                Confirm dates
              </button>
              <button
                type="button"
                onClick={() =>
                  setVisibleMonth((prev) =>
                    shiftMonth(prev.year, prev.month, 1)
                  )
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
