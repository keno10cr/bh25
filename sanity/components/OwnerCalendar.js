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
  grid: {
    border: "1px solid var(--card-border-color, #d0d0d0)",
    borderRadius: 8,
    overflow: "hidden",
  },
  weekRow: { display: "flex" },
  weekday: {
    flex: "1 1 14.28%",
    maxWidth: "14.28%",
    padding: 8,
    fontSize: 12,
    fontWeight: 600,
    textAlign: "center",
    borderBottom: "1px solid var(--card-border-color, #d0d0d0)",
  },
  cell: {
    flex: "1 1 14.28%",
    maxWidth: "14.28%",
    minHeight: 84,
    padding: 8,
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

  const dayMap = useMemo(() => {
    const map = new Map();
    const matchProperty = (id) => propertyId === "all" || id === propertyId;

    (data.blocks || []).forEach((block) => {
      if (!matchProperty(block.propertyId)) return;
      eachIsoInRange(block.startDate, block.endDate).forEach((iso) => {
        const entry = map.get(iso) || { blocked: [], booked: [] };
        entry.blocked.push(block);
        map.set(iso, entry);
      });
    });

    (data.bookings || []).forEach((booking) => {
      if (!matchProperty(booking.propertyId)) return;
      occupiedNights(booking.checkIn, booking.checkOut).forEach((iso) => {
        const entry = map.get(iso) || { blocked: [], booked: [] };
        entry.booked.push(booking);
        map.set(iso, entry);
      });
    });

    return map;
  }, [data, propertyId]);

  const cells = useMemo(() => {
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list = [];
    for (let i = 0; i < firstWeekday; i += 1) list.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      list.push(day);
    }
    return list;
  }, [year, month]);

  const shiftMonth = (delta) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  return (
    <div style={styles.root}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Owner calendar</h2>
          <p style={styles.muted}>
            Open nights stay clear. Owner blocks and paid bookings share this grid.
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

      <div style={styles.grid}>
        <div style={styles.weekRow}>
          {WEEKDAYS.map((label) => (
            <div key={label} style={styles.weekday}>
              {label}
            </div>
          ))}
        </div>
        <div style={styles.weekRow}>
          {cells.map((day, index) => {
            if (!day) {
              return (
                <div
                  key={`empty-${index}`}
                  style={{
                    ...styles.cell,
                    background: "var(--card-muted-bg-color, #f4f4f4)",
                  }}
                />
              );
            }

            const iso = toIso(year, month, day);
            const entry = dayMap.get(iso);
            const isBooked = Boolean(entry?.booked?.length);
            const isBlocked = Boolean(entry?.blocked?.length);
            const background = isBooked
              ? "rgba(34, 139, 80, 0.18)"
              : isBlocked
                ? "rgba(180, 83, 9, 0.16)"
                : "transparent";
            const title = [
              isBooked
                ? `Booked: ${entry.booked
                    .map((b) => b.guestName || b.confirmationCode)
                    .join(", ")}`
                : null,
              isBlocked
                ? `Blocked: ${entry.blocked.map((b) => b.title).join(", ")}`
                : null,
            ]
              .filter(Boolean)
              .join(" | ");

            return (
              <div key={iso} title={title} style={{ ...styles.cell, background }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{day}</div>
                {isBooked ? (
                  <div style={{ marginTop: 6, fontSize: 11, color: "#166534" }}>
                    Booked
                  </div>
                ) : null}
                {isBlocked && !isBooked ? (
                  <div style={{ marginTop: 6, fontSize: 11, color: "#9a3412" }}>
                    Blocked
                  </div>
                ) : null}
                {isBlocked && isBooked ? (
                  <div style={{ marginTop: 4, fontSize: 11, opacity: 0.7 }}>
                    + block
                  </div>
                ) : null}
              </div>
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
