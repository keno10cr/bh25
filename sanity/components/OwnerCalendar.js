"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useClient } from "sanity";

const MONTH_LABELS = [
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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const LABEL_WIDTH = 220;
const DAY_MIN_WIDTH = 36;

const styles = {
  root: {
    padding: 24,
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    color: "var(--card-fg-color, #1a1a1a)",
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  title: { margin: 0, fontSize: 20, fontWeight: 600 },
  muted: { margin: "6px 0 0", fontSize: 13, opacity: 0.7 },
  controls: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  select: {
    minWidth: 200,
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid var(--card-border-color, #d0d0d0)",
    background: "var(--card-bg-color, #fff)",
    color: "inherit",
  },
  button: {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid var(--card-border-color, #d0d0d0)",
    background: "var(--card-bg-color, #fff)",
    color: "inherit",
    cursor: "pointer",
  },
  monthNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  scroller: {
    overflow: "auto",
    border: "1px solid var(--card-border-color, #d0d0d0)",
    borderRadius: 8,
    maxHeight: "70vh",
  },
  labelCell: {
    position: "sticky",
    left: 0,
    zIndex: 2,
    width: LABEL_WIDTH,
    minWidth: LABEL_WIDTH,
    maxWidth: LABEL_WIDTH,
    padding: "8px 10px",
    boxSizing: "border-box",
    background: "var(--card-bg-color, #fff)",
    borderRight: "1px solid var(--card-border-color, #d0d0d0)",
    borderBottom: "1px solid var(--card-border-color, #d0d0d0)",
    fontSize: 12,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
  },
  headerLabel: {
    position: "sticky",
    left: 0,
    top: 0,
    zIndex: 3,
    background: "var(--card-muted-bg-color, #f4f4f4)",
  },
  dayHeader: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    minWidth: DAY_MIN_WIDTH,
    padding: "6px 2px",
    textAlign: "center",
    borderBottom: "1px solid var(--card-border-color, #d0d0d0)",
    borderRight: "1px solid var(--card-border-color, #d0d0d0)",
    background: "var(--card-muted-bg-color, #f4f4f4)",
    boxSizing: "border-box",
  },
  dayNum: { fontSize: 12, fontWeight: 600, lineHeight: 1.2 },
  dayWeek: { fontSize: 10, opacity: 0.65, marginTop: 2 },
  dayCell: {
    minWidth: DAY_MIN_WIDTH,
    minHeight: 28,
    borderBottom: "1px solid var(--card-border-color, #d0d0d0)",
    borderRight: "1px solid var(--card-border-color, #d0d0d0)",
    boxSizing: "border-box",
  },
  legend: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    marginTop: 16,
    fontSize: 13,
  },
  error: {
    padding: 12,
    borderRadius: 6,
    background: "rgba(200, 40, 40, 0.12)",
    color: "#8a1f1f",
    marginBottom: 12,
    fontSize: 13,
  },
};

function pad(n) {
  return String(n).padStart(2, "0");
}

function toIso(year, monthIndex, day) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function eachIsoInRange(startIso, endIso) {
  if (!startIso || !endIso || endIso < startIso) return [];
  const out = [];
  const [ys, ms, ds] = startIso.split("-").map(Number);
  const [ye, me, de] = endIso.split("-").map(Number);
  const cursor = new Date(Date.UTC(ys, ms - 1, ds));
  const end = new Date(Date.UTC(ye, me - 1, de));
  while (cursor <= end) {
    out.push(
      `${cursor.getUTCFullYear()}-${pad(cursor.getUTCMonth() + 1)}-${pad(cursor.getUTCDate())}`
    );
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

function occupiedNights(checkIn, checkOut) {
  if (!checkIn || !checkOut || checkOut <= checkIn) return [];
  const [y, m, d] = checkOut.split("-").map(Number);
  const last = new Date(Date.UTC(y, m - 1, d));
  last.setUTCDate(last.getUTCDate() - 1);
  const endIso = `${last.getUTCFullYear()}-${pad(last.getUTCMonth() + 1)}-${pad(last.getUTCDate())}`;
  return eachIsoInRange(checkIn, endIso);
}

function getDayEntry(byProperty, propertyKey, iso) {
  let dayMap = byProperty.get(propertyKey);
  if (!dayMap) {
    dayMap = new Map();
    byProperty.set(propertyKey, dayMap);
  }
  let entry = dayMap.get(iso);
  if (!entry) {
    entry = { blocked: [], booked: [] };
    dayMap.set(iso, entry);
  }
  return entry;
}

function cellTitle(entry) {
  if (!entry) return "";
  return [
    entry.booked?.length
      ? `Booked: ${entry.booked
          .map((item) => item.guestName || item.confirmationCode)
          .join(", ")}`
      : null,
    entry.blocked?.length
      ? `Blocked: ${entry.blocked.map((item) => item.title).join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join(" | ");
}

function cellBackground(entry) {
  if (entry?.booked?.length) return "rgba(34, 139, 80, 0.28)";
  if (entry?.blocked?.length) return "rgba(180, 83, 9, 0.22)";
  return "transparent";
}

const CALENDAR_QUERY = `{
  "properties": *[_type == "property" && !(_id in path("drafts.**"))] | order(name asc) {
    _id,
    name,
    "slug": slug.current
  },
  "blocks": *[_type == "blockedDate" && !(_id in path("drafts.**"))]{
    _id,
    title,
    startDate,
    endDate,
    reason,
    "propertyId": property._ref,
    "propertyName": property->name
  },
  "bookings": *[_type == "stayBooking" && paymentStatus == "paid" && !(_id in path("drafts.**"))]{
    _id,
    confirmationCode,
    guestName,
    checkIn,
    checkOut,
    "propertyId": property._ref,
    "propertyName": property->name
  }
}`;

export function OwnerCalendar() {
  const client = useClient({ apiVersion: "2025-08-01" });
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [propertyId, setPropertyId] = useState("all");
  const [data, setData] = useState({ properties: [], blocks: [], bookings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await client.fetch(CALENDAR_QUERY);
      setData({
        properties: result?.properties || [],
        blocks: result?.blocks || [],
        bookings: result?.bookings || [],
      });
    } catch (err) {
      console.error(err);
      setError("Could not load calendar data.");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    load();
  }, [load]);

  const visibleProperties = useMemo(() => {
    const properties = data.properties || [];
    if (propertyId === "all") return properties;
    return properties.filter((property) => property._id === propertyId);
  }, [data.properties, propertyId]);

  const occupancyByProperty = useMemo(() => {
    const byProperty = new Map();
    const allowed = new Set(visibleProperties.map((property) => property._id));

    (data.blocks || []).forEach((block) => {
      if (!block.propertyId || !allowed.has(block.propertyId)) return;
      eachIsoInRange(block.startDate, block.endDate).forEach((iso) => {
        getDayEntry(byProperty, block.propertyId, iso).blocked.push(block);
      });
    });

    (data.bookings || []).forEach((booking) => {
      if (!booking.propertyId || !allowed.has(booking.propertyId)) return;
      occupiedNights(booking.checkIn, booking.checkOut).forEach((iso) => {
        getDayEntry(byProperty, booking.propertyId, iso).booked.push(booking);
      });
    });

    return byProperty;
  }, [data.blocks, data.bookings, visibleProperties]);

  const days = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => index + 1);
  }, [year, month]);

  const shiftMonth = (delta) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  const gridTemplateColumns = `${LABEL_WIDTH}px repeat(${days.length}, minmax(${DAY_MIN_WIDTH}px, 1fr))`;

  return (
    <div style={styles.root}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Owner calendar</h2>
          <p style={styles.muted}>
            Each villa has its own row. Open nights stay clear. Owner blocks and
            paid bookings stay on that villa.
          </p>
        </div>
        <div style={styles.controls}>
          <select
            style={styles.select}
            value={propertyId}
            onChange={(event) => setPropertyId(event.target.value)}
          >
            <option value="all">All properties</option>
            {data.properties.map((property) => (
              <option key={property._id} value={property._id}>
                {property.name || property.slug || property._id}
              </option>
            ))}
          </select>
          <button type="button" style={styles.button} onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      <div style={styles.monthNav}>
        <button type="button" style={styles.button} onClick={() => shiftMonth(-1)}>
          Previous
        </button>
        <strong>
          {MONTH_LABELS[month]} {year}
        </strong>
        <button type="button" style={styles.button} onClick={() => shiftMonth(1)}>
          Next
        </button>
      </div>

      {error ? <div style={styles.error}>{error}</div> : null}

      <div style={styles.scroller}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns,
            minWidth: LABEL_WIDTH + days.length * DAY_MIN_WIDTH,
          }}
        >
          <div style={{ ...styles.labelCell, ...styles.headerLabel }}>Villa</div>
          {days.map((day) => {
            const weekday = WEEKDAYS[new Date(year, month, day).getDay()];
            return (
              <div key={`head-${day}`} style={styles.dayHeader}>
                <div style={styles.dayNum}>{day}</div>
                <div style={styles.dayWeek}>{weekday}</div>
              </div>
            );
          })}

          {visibleProperties.map((property) => {
            const dayMap = occupancyByProperty.get(property._id);
            return (
              <PropertyRow
                key={property._id}
                property={property}
                days={days}
                year={year}
                month={month}
                dayMap={dayMap}
              />
            );
          })}
        </div>
      </div>

      <div style={styles.legend}>
        <span>
          <span style={{ color: "#166534" }}>■</span> Paid booking
        </span>
        <span>
          <span style={{ color: "#9a3412" }}>■</span> Owner / manual block
        </span>
        <span style={{ opacity: 0.7 }}>
          Create blocks under Calendar → Blocked dates. Paid stays appear after
          webhook confirmation.
        </span>
      </div>

      {loading ? <p style={styles.muted}>Loading…</p> : null}
    </div>
  );
}

function PropertyRow({ property, days, year, month, dayMap }) {
  const label = property.name || property.slug || property._id;
  return (
    <>
      <div style={styles.labelCell} title={label}>
        {label}
      </div>
      {days.map((day) => {
        const iso = toIso(year, month, day);
        const entry = dayMap?.get(iso);
        return (
          <div
            key={`${property._id}-${iso}`}
            title={cellTitle(entry)}
            style={{ ...styles.dayCell, background: cellBackground(entry) }}
          />
        );
      })}
    </>
  );
}
