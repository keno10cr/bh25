"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatStayDate } from "@/lib/checkout";
import { occupiedNightsFromStay } from "@/lib/availabilityDates";
import {
  STAY_DISCOUNT_MIN_NIGHTS,
  buildAddOnLines,
  buildGroupQuote,
  foldCleaningFee,
  roundMoney,
  unavailableNightsInStay,
} from "@/lib/groupQuote";
import DateRangePicker from "@/components/date-range-picker";
import {
  getDefaultPublishedNightly,
  resolveBaseGuestCount,
  resolveExtraGuestFeePerNight,
  resolveMinimumNights,
} from "@/lib/propertyPricing";
import { PROPOSAL_COPY } from "@/components/proposal-generator/copy";
import {
  CLEANING_FEE_ID,
  normalizeCheckoutFees,
  resolveFeeTitle,
} from "@/lib/checkoutFees";
import {
  convertAmount,
  crcRate,
  formatCrc,
  propertyInCrc,
  usdToCrc,
} from "@/lib/currency";
import { resolveLengthOfStayDiscount, stayDiscountPercents } from "@/lib/stayDiscounts";
import { ADD_ON_PRESETS, QUOTE_COPY } from "./copy";
import styles from "./group-quote-tool.module.css";

const DEFAULT_PHONES = [
  { label: "+506 8926 2630", tel: "+50689262630" },
  { label: "+1 (754) 610 4710", tel: "+17546104710" },
];

function phoneCountry(tel) {
  if (tel.startsWith("+506")) return "Costa Rica";
  if (tel.startsWith("+1")) return "United States";
  return "Phone";
}

function withFeeRate(title, fee) {
  return fee.feeType === "percentage" ? `${title} (${fee.amount}%)` : title;
}

function money(amount, currency = "USD", lang = "en") {
  const value = Number.isFinite(amount) ? amount : 0;
  const whole = Math.abs(value - Math.round(value)) < 0.005;
  if (lang === "es" && currency === "USD") {
    return `$${new Intl.NumberFormat("es-CR", {
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value)}`;
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

function rateLabel(rate) {
  return `₡${Number(rate || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function parseRate(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function shortDate(iso) {
  const [y, m, d] = (iso || "").split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatDate(iso, locale) {
  if (!iso) return "";
  if (locale === "en-US") return formatStayDate(iso);
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function localIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDaysIso(iso, days) {
  const [y, m, d] = iso.split("-").map(Number);
  return localIso(new Date(y, m - 1, d + days));
}

function safeFilename(value, fallback) {
  return (
    String(value || "")
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) || fallback
  );
}

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function Segmented({ value, options, onChange, label }) {
  return (
    <div className={styles.segmented} role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={value === option.value ? styles.segmentActive : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function GuestStepper({ value, min = 1, max, onChange, label }) {
  return (
    <div className={styles.stepper}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Fewer guests in ${label}`}
      >
        −
      </button>
      <output aria-live="polite">{value}</output>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`More guests in ${label}`}
      >
        +
      </button>
    </div>
  );
}

export default function GroupQuoteTool({
  villas = [],
  settings = {},
  minDate,
  exchangeRate = null,
  contact = {},
}) {
  const documentRef = useRef(null);
  const phones = contact.phones?.length ? contact.phones : DEFAULT_PHONES;
  const defaultPhone =
    phones.find((phone) => phone.tel.startsWith("+506")) || phones[0];
  const [lang, setLang] = useState("en");
  const [phoneTel, setPhoneTel] = useState(defaultPhone.tel);
  const [client, setClient] = useState({
    groupName: "",
    contactName: "",
    notes: "",
    validDays: "14",
  });
  const [quoteNumber, setQuoteNumber] = useState("");
  const [issuedIso, setIssuedIso] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selected, setSelected] = useState({});
  const [discount, setDiscount] = useState({
    type: "percent",
    value: "",
    label: "Group discount",
  });
  const sitePercents = useMemo(() => stayDiscountPercents(settings), [settings]);
  const [stayDiscounts, setStayDiscounts] = useState(() => ({
    weekly: { enabled: sitePercents.weekly > 0, percent: String(sitePercents.weekly || 15) },
    monthly: { enabled: sitePercents.monthly > 0, percent: String(sitePercents.monthly || 30) },
  }));
  const [priceDisplay, setPriceDisplay] = useState("original");
  const [rateDetail, setRateDetail] = useState("itemized");
  const [showExceptions, setShowExceptions] = useState(true);
  const [excludedFeeIds, setExcludedFeeIds] = useState([]);
  const [includeTax, setIncludeTax] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const [rateInput, setRateInput] = useState(
    exchangeRate?.rate ? String(exchangeRate.rate) : ""
  );
  const [addOns, setAddOns] = useState([]);
  const addOnCounter = useRef(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    const today = localIso(new Date());
    setIssuedIso(today);
    setQuoteNumber(
      `BHGR${today.slice(2).replace(/-/g, "")}${Math.floor(1000 + Math.random() * 9000)}`
    );
  }, []);

  const groupNights = useMemo(
    () => occupiedNightsFromStay(checkIn, checkOut),
    [checkIn, checkOut]
  );

  const allSelections = useMemo(
    () =>
      villas
        .filter((villa) => selected[villa.id])
        .map((villa) => {
          const pick = selected[villa.id];
          const stayIn = pick.customDates ? pick.checkIn : checkIn;
          const stayOut = pick.customDates ? pick.checkOut : checkOut;
          const conflicts = unavailableNightsInStay(
            occupiedNightsFromStay(stayIn, stayOut),
            villa.unavailableDates
          );
          return {
            property: villa,
            guests: pick.guests,
            customDates: pick.customDates,
            checkIn: stayIn,
            checkOut: stayOut,
            conflicts,
            quoteAnyway:
              conflicts.length > 0 && pick.quoteAnywayFor === conflicts.join(","),
          };
        }),
    [villas, selected, checkIn, checkOut]
  );
  /**
   * Booked villas stay out of every total and the PDF. The override is tied to the
   * exact blocked nights, so changing dates drops the villa out again.
   */
  const selections = useMemo(
    () =>
      allSelections.filter(
        (selection) => selection.conflicts.length === 0 || selection.quoteAnyway
      ),
    [allSelections]
  );
  const bookedOut = allSelections.filter(
    (selection) => selection.conflicts.length > 0 && !selection.quoteAnyway
  );

  const activeRate = parseRate(rateInput);
  const inColones = displayCurrency === "CRC";
  const hasColonAddOns = addOns.some(
    (item) => item.currency === "CRC" && Number(item.price) > 0
  );
  const rateMissing = (inColones || hasColonAddOns) && !activeRate;

  const groupSize = selections.reduce((sum, s) => sum + (s.guests || 0), 0);
  const defaultUnits = (item) =>
    item.category === "meal" ? groupNights.length || 1 : 1;

  /** Add on prices in the quote currency. Dollar prices become rounded colón list prices. */
  const addOnLinesIn = (target) =>
    buildAddOnLines(
      addOns.map((item) => {
        const price = Number(item.price) || 0;
        let unitPrice = price;
        if (item.currency !== target) {
          if (!activeRate) unitPrice = 0;
          else if (target === "CRC") unitPrice = usdToCrc(price, activeRate);
          else unitPrice = convertAmount(price, "CRC", "USD", activeRate);
        }
        return {
          id: item.id,
          category: item.category,
          name: item.name.trim(),
          unitPriceUsd: unitPrice,
          people: item.people ?? groupSize,
          units: item.units ?? defaultUnits(item),
        };
      })
    );
  const addOnLinesUsd = useMemo(
    () => addOnLinesIn("USD"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addOns, activeRate, groupSize, groupNights.length]
  );
  const addOnLinesCrc = useMemo(
    () => addOnLinesIn("CRC"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addOns, activeRate, groupSize, groupNights.length]
  );

  const addAddOn = (category, preset = null) => {
    addOnCounter.current += 1;
    setAddOns((prev) => [
      ...prev,
      {
        id: `addon-${addOnCounter.current}`,
        presetKey: preset?.key || null,
        category,
        name: preset ? preset[lang] : "",
        price: "",
        currency: displayCurrency,
        people: null,
        units: null,
      },
    ]);
  };

  const updateAddOn = (id, patch) => {
    setAddOns((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const removeAddOn = (id) => {
    setAddOns((prev) => prev.filter((item) => item.id !== id));
  };
  const rateIsLive =
    Boolean(exchangeRate?.rate) && activeRate === exchangeRate.rate;

  /** A fixed discount is typed in the display currency; the other quote gets it converted. */
  const discountIn = (target) => {
    if (discount.type !== "fixed" || displayCurrency === target) return discount;
    const value = Number(discount.value);
    return {
      ...discount,
      value:
        activeRate && Number.isFinite(value)
          ? convertAmount(value, displayCurrency, target, activeRate)
          : 0,
    };
  };

  const quoteUsd = useMemo(
    () =>
      buildGroupQuote({
        selections,
        stayDiscounts,
        discount: discountIn("USD"),
        addOns: addOnLinesUsd,
        excludedFeeIds,
        includeTax,
        settings,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selections, stayDiscounts, discount, displayCurrency, activeRate, addOnLinesUsd, excludedFeeIds, includeTax, settings]
  );

  /** Same quote run on colón list prices, so every colón line adds up exactly. */
  const quoteCrc = useMemo(
    () =>
      activeRate
        ? buildGroupQuote({
            selections: selections.map((selection) => ({
              ...selection,
              property: propertyInCrc(selection.property, activeRate),
            })),
            stayDiscounts,
            discount: discountIn("CRC"),
            addOns: addOnLinesCrc,
            excludedFeeIds,
            includeTax,
            settings,
          })
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selections, stayDiscounts, discount, displayCurrency, activeRate, addOnLinesCrc, excludedFeeIds, includeTax, settings]
  );

  const quote = inColones && quoteCrc ? quoteCrc : quoteUsd;
  const docQuote = useMemo(() => foldCleaningFee(quote), [quote]);
  const docRows = docQuote.rows.filter((row) => row.quote);

  /** Villas whose stay discount here is lower than what the same stay gets online. */
  const belowWebsiteRate = quoteUsd.rows
    .filter((row) => {
      if (!row.quote) return false;
      const site = resolveLengthOfStayDiscount(row.quote.nights, sitePercents);
      return site && (row.stayDiscount?.percent ?? 0) < site.percent;
    })
    .map((row) => row.property.name);

  const updateStayDiscount = (kind, patch) => {
    setStayDiscounts((prev) => ({ ...prev, [kind]: { ...prev[kind], ...patch } }));
  };

  const hasFlatCleaning = villas.some((villa) => Number(villa.cleaningFee) > 0);
  const checkoutFees = useMemo(() => {
    const catalog = normalizeCheckoutFees(settings);
    if (!hasFlatCleaning) return catalog;
    return [
      {
        feeId: CLEANING_FEE_ID,
        titleEn: "Cleaning fee",
        titleEs: "Tarifa de limpieza",
        feeType: "flat",
        perVilla: true,
      },
      ...catalog.filter((fee) => fee.feeId !== CLEANING_FEE_ID),
    ];
  }, [settings, hasFlatCleaning]);
  const toggleFee = (feeId, on) => {
    setExcludedFeeIds((prev) =>
      on ? prev.filter((id) => id !== feeId) : [...prev, feeId]
    );
  };
  const taxRate = Math.max(0, Number(settings.taxRate) || 0);
  const taxTitle = settings.taxLabelEn || "Tax";

  const pricedRows = quote.rows.filter((row) => row.quote);
  const hasContent = pricedRows.length > 0 || quote.addOnLines.length > 0;
  const currency = "USD";
  const fmt = (amount, language = "en") =>
    inColones && quoteCrc ? formatCrc(amount) : money(amount, currency, language);
  const docFmt = (amount) => fmt(amount, lang);
  /** A USD list price from Sanity, shown in the display currency. */
  const fmtPrice = (usd) =>
    inColones && activeRate ? formatCrc(usdToCrc(usd, activeRate)) : money(usd, currency);
  const bufferedRate = crcRate(activeRate);

  const t = QUOTE_COPY[lang];
  const feeTitle = (fee) =>
    fee.feeId === CLEANING_FEE_ID ? t.cleaningFee : resolveFeeTitle(fee, lang);
  const leftOff = [
    ...checkoutFees
      .filter((fee) => excludedFeeIds.includes(fee.feeId))
      .map(feeTitle),
    ...(includeTax || taxRate === 0 ? [] : [t.taxLabel(settings)]),
  ];
  const villaExceptions = (row) => {
    if (!showExceptions) return [];
    const custom = (selected[row.property.id]?.exceptions || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    return [
      ...(row.quote.nights < row.minimumNights
        ? [t.minStayWaived(row.minimumNights, row.quote.nights)]
        : []),
      ...custom,
    ];
  };
  const brand = PROPOSAL_COPY[lang] || PROPOSAL_COPY.en;
  const contactEmail = contact.email || brand.contactEmail;
  const selectedPhone =
    phones.find((phone) => phone.tel === phoneTel) || defaultPhone;
  const docDate = (iso) => formatDate(iso, t.locale);
  const lineLabel = (line, seasons = []) => {
    if (line.kind === "extraGuest") return t.extraGuests(line.extraGuests);
    if (line.label === "Standard rate") return t.standardRate;
    if (lang === "es") {
      const season = seasons.find((s) => s.titleEn?.trim() === line.label);
      if (season?.titleEs?.trim()) return season.titleEs.trim();
    }
    return line.label;
  };

  const switchLanguage = (next) => {
    if (next === lang) return;
    setDiscount((prev) =>
      prev.label.trim() === QUOTE_COPY[lang].defaultDiscountLabel
        ? { ...prev, label: QUOTE_COPY[next].defaultDiscountLabel }
        : prev
    );
    setAddOns((prev) =>
      prev.map((item) => {
        const preset = ADD_ON_PRESETS.find((p) => p.key === item.presetKey);
        return preset && item.name.trim() === preset[lang]
          ? { ...item, name: preset[next] }
          : item;
      })
    );
    setLang(next);
  };

  const switchCurrency = (next) => {
    if (next === displayCurrency) return;
    const value = Number(discount.value);
    if (discount.type === "fixed" && activeRate && Number.isFinite(value) && value > 0) {
      const converted = convertAmount(value, displayCurrency, next, activeRate);
      setDiscount((prev) => ({
        ...prev,
        value: String(next === "CRC" ? Math.round(converted) : Math.round(converted * 100) / 100),
      }));
    }
    setDisplayCurrency(next);
  };
  const showDiscount = priceDisplay === "original" && quote.discountAmount > 0;
  const discountTitle = `${discount.label.trim() || t.defaultDiscountLabel}${
    discount.type === "percent" && quote.groupDiscountAmount > 0
      ? ` (${Number(discount.value)}%)`
      : ""
  }`;
  const stayDiscountTitle = (line, language = lang) =>
    QUOTE_COPY[language].stayDiscount(line.kind, line.percent);
  const summaryRows = (q) => [
    { key: "accommodation", label: "Accommodation", amount: q.subtotal },
    ...q.stayDiscountLines.map((line) => ({
      key: `stay-${line.kind}-${line.percent}`,
      label: stayDiscountTitle(line, "en"),
      amount: line.amount,
      discount: true,
    })),
    ...(q.groupDiscountAmount > 0
      ? [{ key: "group", label: discountTitle, amount: q.groupDiscountAmount, discount: true }]
      : []),
    ...(q.addOnsTotal > 0
      ? [{ key: "addons", label: "Meals and services", amount: q.addOnsTotal }]
      : []),
    ...q.feeLines.map((line) => ({
      key: `fee-${line.feeId}`,
      label: withFeeRate(line.titleEn, line),
      amount: line.subtotal,
    })),
    ...(q.taxes > 0
      ? [{ key: "tax", label: `${taxTitle} (${q.taxRate}%)`, amount: q.taxes }]
      : []),
  ];

  const sharedDates =
    pricedRows.length > 0 &&
    pricedRows.every(
      (row) =>
        row.checkIn === pricedRows[0].checkIn &&
        row.checkOut === pricedRows[0].checkOut
    );
  const stayStart = pricedRows.reduce(
    (min, row) => (!min || row.checkIn < min ? row.checkIn : min),
    ""
  );
  const stayEnd = pricedRows.reduce(
    (max, row) => (!max || row.checkOut > max ? row.checkOut : max),
    ""
  );
  const validUntil =
    issuedIso && Number(client.validDays) > 0
      ? addDaysIso(issuedIso, Math.floor(Number(client.validDays)))
      : "";

  const updateClient = (event) => {
    const { name, value } = event.target;
    setClient((prev) => ({ ...prev, [name]: value }));
  };

  const toggleVilla = (villa) => {
    setSelected((prev) => {
      if (prev[villa.id]) {
        const next = { ...prev };
        delete next[villa.id];
        return next;
      }
      return {
        ...prev,
        [villa.id]: {
          guests: resolveBaseGuestCount(villa),
          customDates: false,
          checkIn: "",
          checkOut: "",
        },
      };
    });
  };

  const updatePick = (villaId, patch) => {
    setSelected((prev) => {
      const current = prev[villaId];
      if (!current) return prev;
      const next = { ...current, ...patch };
      if (patch.customDates && !current.customDates) {
        next.checkIn = checkIn;
        next.checkOut = checkOut;
      }
      if (patch.checkIn && next.checkOut && next.checkOut <= patch.checkIn) {
        next.checkOut = "";
      }
      return { ...prev, [villaId]: next };
    });
  };

  const selectAll = () => {
    setSelected((prev) => {
      const next = { ...prev };
      villas.forEach((villa) => {
        if (!next[villa.id]) {
          next[villa.id] = {
            guests: resolveBaseGuestCount(villa),
            customDates: false,
            checkIn: "",
            checkOut: "",
          };
        }
      });
      return next;
    });
  };

  const logQuote = () => {
    const quote = foldCleaningFee(quoteUsd);
    const payload = {
      quoteNumber,
      groupName: client.groupName,
      contactName: client.contactName,
      checkIn: stayStart,
      checkOut: stayEnd,
      nights: occupiedNightsFromStay(stayStart, stayEnd).length,
      totalGuests: quote.totalGuests,
      validUntil,
      quoteNotes: client.notes,
      villas: quote.rows.filter((row) => row.quote).map((row) => ({
        name: row.property.name,
        guests: row.guests,
        checkIn: row.checkIn,
        checkOut: row.checkOut,
        nights: row.quote.nights,
        subtotal: roundMoney(row.quote.subtotal + row.cleaningIncluded),
        exceptions: villaExceptions(row),
      })),
      total: quote.total,
      subtotal: quote.subtotal,
      discountLabel: quote.groupDiscountAmount > 0 ? discountTitle : "",
      discountAmount: quote.groupDiscountAmount,
      stayDiscounts: quote.stayDiscountLines.map((line) => ({
        title: stayDiscountTitle(line, "en"),
        amount: line.amount,
      })),
      addOnsTotal: quote.addOnsTotal,
      addOns: quote.addOnLines.map((line) => ({
        name: line.name || t.addOnFallback[line.category],
        category: line.category,
        unitPriceUsd: line.unitPriceUsd,
        people: line.people,
        units: line.units,
        total: line.total,
      })),
      fees: quote.feeLines.map((line) => ({
        title: withFeeRate(line.titleEn, line),
        amount: line.subtotal,
      })),
      taxRate: quote.taxRate,
      taxes: quote.taxes,
      language: lang,
      currency: displayCurrency,
      exchangeRate: inColones ? activeRate : null,
      phone: selectedPhone.label,
      priceDisplay,
      rateDetail,
    };
    fetch("/api/group-quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((error) => console.error("Group quote log failed:", error));
  };

  const handleDownload = async () => {
    if (!documentRef.current || downloading || !hasContent || rateMissing) {
      return;
    }
    setDownloading(true);
    setDownloadError("");
    const doc = documentRef.current;
    doc.classList.add(styles.docExporting);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: [8, 8, 10, 8],
          filename: `${t.filename}-${safeFilename(
            client.groupName,
            lang === "es" ? "grupo" : "group"
          )}.pdf`,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(doc)
        .save();
      logQuote();
    } catch (error) {
      console.error("Group quote PDF failed:", error);
      setDownloadError("Could not create the PDF. Please try again.");
    } finally {
      doc.classList.remove(styles.docExporting);
      setDownloading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.toolbar}>
        <div>
          <p className={styles.eyebrow}>Blessed House Group Reservations</p>
          <h1 className={styles.title}>Custom quote generator</h1>
        </div>
        <img
          src="/blessedhouse_logo25.png"
          alt="Villas Blessed House"
          className={styles.toolbarLogo}
        />
      </header>

      <p className={styles.syncBanner} role="note">
        <strong>Note:</strong> External calendar syncs (Airbnb) take 2 to 4 hours to
        update. Always double check live Airbnb status for tight same day bookings.
      </p>

      <div className={styles.layout}>
        <div className={styles.controls}>
          <section className={styles.card}>
            <h2>Client</h2>
            <div className={styles.grid2}>
              <label className={styles.field}>
                <span>Group or client name</span>
                <input
                  name="groupName"
                  value={client.groupName}
                  onChange={updateClient}
                  placeholder="Smith family reunion"
                />
              </label>
              <label className={styles.field}>
                <span>Contact person</span>
                <input
                  name="contactName"
                  value={client.contactName}
                  onChange={updateClient}
                  placeholder="Jane Smith"
                />
              </label>
              <label className={styles.field}>
                <span>Quote number</span>
                <input
                  value={quoteNumber}
                  onChange={(event) => setQuoteNumber(event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Valid for (days)</span>
                <input
                  name="validDays"
                  type="number"
                  min={1}
                  max={365}
                  value={client.validDays}
                  onChange={updateClient}
                />
              </label>
              <label className={`${styles.field} ${styles.fieldWide}`}>
                <span>Notes for the client (optional)</span>
                <textarea
                  name="notes"
                  rows={3}
                  value={client.notes}
                  onChange={updateClient}
                  placeholder="Airport shuttle and welcome dinner can be added on request."
                />
              </label>
            </div>
          </section>

          <section className={styles.card}>
            <h2>Group dates</h2>
            <div className={styles.datesRow}>
              <DateRangePicker
                label="Stay dates"
                checkIn={checkIn}
                checkOut={checkOut}
                minIso={minDate}
                onChange={(range) => {
                  setCheckIn(range.checkIn);
                  setCheckOut(range.checkOut);
                }}
                onClear={() => {
                  setCheckIn("");
                  setCheckOut("");
                }}
              />
              <div className={styles.nightsBox}>
                <strong>{groupNights.length}</strong>
                <span>{groupNights.length === 1 ? "night" : "nights"}</span>
              </div>
            </div>
            <p className={styles.hint}>
              Every villa uses these dates unless you turn on different dates for
              that villa below.
            </p>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2>Villas</h2>
              <div className={styles.cardActions}>
                <button type="button" onClick={selectAll}>
                  Select all
                </button>
                <button type="button" onClick={() => setSelected({})}>
                  Clear
                </button>
              </div>
            </div>
            <p className={styles.hint}>
              Rates, extra guest fees, seasons, and blocked dates come live from
              Sanity.
            </p>

            <ul className={styles.villaList}>
              {villas.map((villa) => {
                const pick = selected[villa.id];
                const row = quote.rows.find((r) => r.property.id === villa.id);
                const groupConflicts = unavailableNightsInStay(
                  groupNights,
                  villa.unavailableDates
                );
                const base = resolveBaseGuestCount(villa);
                const extraFee = resolveExtraGuestFeePerNight(villa);
                const selection = allSelections.find((s) => s.property.id === villa.id);
                const conflicts = selection ? selection.conflicts : groupConflicts;
                const leftOut = Boolean(selection) && conflicts.length > 0 && !selection.quoteAnyway;

                return (
                  <li
                    key={villa.id}
                    className={`${styles.villaRow} ${pick ? styles.villaRowOn : ""} ${
                      pick && conflicts.length > 0 ? styles.villaRowBooked : ""
                    }`}
                  >
                    <label className={styles.villaHead}>
                      <input
                        type="checkbox"
                        checked={Boolean(pick)}
                        onChange={() => toggleVilla(villa)}
                      />
                      {villa.thumb ? (
                        <img
                          src={villa.thumb}
                          alt=""
                          crossOrigin="anonymous"
                          className={styles.villaThumb}
                        />
                      ) : (
                        <span className={styles.villaThumb} />
                      )}
                      <span className={styles.villaInfo}>
                        <strong>{villa.name}</strong>
                        <span>
                          Sleeps {villa.guestsMax} · {fmtPrice(getDefaultPublishedNightly(villa))} / night for {base}
                          {extraFee > 0
                            ? ` · ${fmtPrice(extraFee)} per extra guest`
                            : ""}
                          {Number(villa.cleaningFee) > 0
                            ? ` · ${fmtPrice(villa.cleaningFee)} cleaning`
                            : ""}
                          {` · ${resolveMinimumNights(villa)} night min`}
                        </span>
                      </span>
                      {conflicts.length > 0 ? (
                        <span className={styles.badgeWarn}>
                          ⚠️ Booked {plural(conflicts.length, "night")}
                        </span>
                      ) : groupNights.length > 0 || row?.quote ? (
                        <span className={styles.badgeOk}>Available</span>
                      ) : null}
                    </label>

                    {pick ? (
                      <div className={styles.villaBody}>
                        <div className={styles.villaControls}>
                          <div className={styles.inlineField}>
                            <span>Guests</span>
                            <GuestStepper
                              value={pick.guests}
                              max={villa.guestsMax}
                              label={villa.name}
                              onChange={(guests) => updatePick(villa.id, { guests })}
                            />
                          </div>
                          <label className={styles.check}>
                            <input
                              type="checkbox"
                              checked={pick.customDates}
                              onChange={(event) =>
                                updatePick(villa.id, {
                                  customDates: event.target.checked,
                                })
                              }
                            />
                            Different dates
                          </label>
                          <div className={styles.villaTotal}>
                            {leftOut ? (
                              <span className={styles.warn}>Not quoted</span>
                            ) : row?.quote ? (
                              <>
                                <strong>{fmt(row.quote.subtotal)}</strong>
                                <span>{plural(row.quote.nights, "night")}</span>
                              </>
                            ) : (
                              <span>Add dates to price</span>
                            )}
                          </div>
                        </div>

                        {pick.customDates ? (
                          <DateRangePicker
                            label={`Dates for ${villa.name}`}
                            checkIn={pick.checkIn}
                            checkOut={pick.checkOut}
                            minIso={minDate}
                            unavailableDates={villa.unavailableDates}
                            onChange={(range) => updatePick(villa.id, range)}
                          />
                        ) : null}

                        {row?.quote ? (
                          <ul className={styles.lineList}>
                            {row.quote.lines.map((line) => (
                              <li key={`${line.kind}-${line.label}-${line.rate}`}>
                                <span>
                                  {line.label}: {line.count} × {fmt(line.rate)}
                                </span>
                                <span>{fmt(line.subtotal)}</span>
                              </li>
                            ))}
                            {row.stayDiscount ? (
                              <li className={styles.lineDiscount}>
                                <span>{stayDiscountTitle(row.stayDiscount, "en")}</span>
                                <span>−{fmt(row.stayDiscount.amount)}</span>
                              </li>
                            ) : null}
                            {(row.feeLines || [])
                              .filter((line) => line.feeType === "flat")
                              .map((line) => (
                                <li key={line.feeId}>
                                  <span>{line.titleEn} (once per stay)</span>
                                  <span>{fmt(line.subtotal)}</span>
                                </li>
                              ))}
                          </ul>
                        ) : null}

                        {conflicts.length > 0 ? (
                          <div className={styles.bookedAlert} role="alert">
                            <strong>⚠️ Booked/Unavailable for selected dates</strong>
                            <span>
                              Blocked on {conflicts.slice(0, 6).map(shortDate).join(", ")}
                              {conflicts.length > 6 ? " and more" : ""}.{" "}
                              {leftOut
                                ? "Left out of the quote total and the PDF."
                                : "Included in the quote and PDF anyway."}
                            </span>
                            <label className={styles.check}>
                              <input
                                type="checkbox"
                                checked={!leftOut}
                                onChange={(event) =>
                                  updatePick(villa.id, {
                                    quoteAnywayFor: event.target.checked
                                      ? conflicts.join(",")
                                      : "",
                                  })
                                }
                              />
                              Quote anyway (I confirmed these nights are free)
                            </label>
                          </div>
                        ) : null}
                        {row?.quote && row.quote.nights < row.minimumNights ? (
                          <p className={styles.note}>
                            Shorter than the {row.minimumNights} night online minimum.
                            {showExceptions ? " Shown on the PDF as a special exception." : ""}
                          </p>
                        ) : null}
                        {showExceptions ? (
                          <label className={styles.field}>
                            <span>Other exceptions for this villa</span>
                            <textarea
                              rows={2}
                              value={pick.exceptions || ""}
                              placeholder="One per line, in the PDF language. Example: Early check in at 11 AM"
                              onChange={(event) =>
                                updatePick(villa.id, { exceptions: event.target.value })
                              }
                            />
                          </label>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={styles.card}>
            <h2>Meals and services</h2>
            <div className={styles.presetBar}>
              <span>Meals</span>
              {ADD_ON_PRESETS.filter((p) => p.category === "meal").map((preset) => (
                <button key={preset.key} type="button" onClick={() => addAddOn("meal", preset)}>
                  + {preset.en}
                </button>
              ))}
              <button type="button" onClick={() => addAddOn("meal")}>
                + Custom meal
              </button>
            </div>
            <div className={styles.presetBar}>
              <span>Services</span>
              {ADD_ON_PRESETS.filter((p) => p.category === "service").map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => addAddOn("service", preset)}
                >
                  + {preset.en}
                </button>
              ))}
              <button type="button" onClick={() => addAddOn("service")}>
                + Custom service
              </button>
            </div>

            {addOns.length > 0 ? (
              <div className={styles.addOnTable}>
                <div className={styles.addOnHead} aria-hidden="true">
                  <span>Item</span>
                  <span>Unit price</span>
                  <span>People</span>
                  <span>Days or units</span>
                  <span>Total</span>
                  <span />
                </div>
                {addOns.map((item, index) => {
                  const line = (inColones && quoteCrc ? addOnLinesCrc : addOnLinesUsd)[index];
                  return (
                    <div key={item.id} className={styles.addOnRow}>
                      <div className={styles.addOnName}>
                        <span className={styles.categoryTag}>
                          {item.category === "meal" ? "Meal" : "Service"}
                        </span>
                        <input
                          value={item.name}
                          placeholder={item.category === "meal" ? "Group dinner" : "Snorkel tour"}
                          aria-label="Item name"
                          onChange={(event) => updateAddOn(item.id, { name: event.target.value })}
                        />
                      </div>
                      <div className={styles.priceInput}>
                        <select
                          aria-label="Price currency"
                          value={item.currency}
                          onChange={(event) =>
                            updateAddOn(item.id, { currency: event.target.value })
                          }
                        >
                          <option value="USD">$ USD</option>
                          <option value="CRC">₡ CRC</option>
                        </select>
                        <input
                          type="number"
                          min={0}
                          step={item.currency === "CRC" ? 500 : 1}
                          value={item.price}
                          placeholder="0"
                          aria-label="Unit price per person"
                          onChange={(event) => updateAddOn(item.id, { price: event.target.value })}
                        />
                      </div>
                      <div className={styles.qtyCell}>
                        <input
                          type="number"
                          min={0}
                          value={item.people ?? groupSize}
                          aria-label="Number of people"
                          onChange={(event) => updateAddOn(item.id, { people: event.target.value })}
                        />
                        {item.people === null ? (
                          <small>Group size</small>
                        ) : (
                          <button type="button" onClick={() => updateAddOn(item.id, { people: null })}>
                            Use group size
                          </button>
                        )}
                      </div>
                      <div className={styles.qtyCell}>
                        <input
                          type="number"
                          min={0}
                          value={item.units ?? defaultUnits(item)}
                          aria-label="Number of days or units"
                          onChange={(event) => updateAddOn(item.id, { units: event.target.value })}
                        />
                        {item.units === null ? (
                          <small>{item.category === "meal" ? "Stay nights" : "Default"}</small>
                        ) : (
                          <button type="button" onClick={() => updateAddOn(item.id, { units: null })}>
                            Reset
                          </button>
                        )}
                      </div>
                      <strong className={styles.addOnTotal}>{fmt(line?.total ?? 0)}</strong>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        aria-label={`Remove ${item.name || "item"}`}
                        onClick={() => removeAddOn(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
            <p className={styles.hint}>
              Line total is unit price × people × days or units. The discount applies to
              villa rates only.
              {bufferedRate
                ? ` Prices in the other currency convert at ${rateLabel(bufferedRate)} per USD (base rate plus 12%).`
                : ""}
            </p>
          </section>

          <section className={styles.card}>
            <h2>Discounts</h2>
            <div className={styles.stayDiscounts}>
              {[
                [
                  "weekly",
                  "Weekly discount",
                  `Automatic for villas staying ${STAY_DISCOUNT_MIN_NIGHTS.weekly} to ${STAY_DISCOUNT_MIN_NIGHTS.monthly - 1} nights, same as the website.`,
                ],
                [
                  "monthly",
                  "Monthly discount",
                  `Automatic for villas staying ${STAY_DISCOUNT_MIN_NIGHTS.monthly} nights or more. Replaces the weekly discount.`,
                ],
              ].map(([kind, label, hint]) => {
                const option = stayDiscounts[kind];
                const applied = quote.rows.filter((row) => row.stayDiscount?.kind === kind).length;
                return (
                  <div
                    key={kind}
                    className={`${styles.stayOption} ${option.enabled ? styles.stayOptionOn : ""}`}
                  >
                    <div className={styles.stayOptionHead}>
                      <label className={styles.check}>
                        <input
                          type="checkbox"
                          checked={option.enabled}
                          onChange={(event) =>
                            updateStayDiscount(kind, { enabled: event.target.checked })
                          }
                        />
                        <span>{label}</span>
                      </label>
                      <label className={styles.stayPercent}>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={option.percent}
                          aria-label={`${label} percent`}
                          onChange={(event) =>
                            updateStayDiscount(kind, { percent: event.target.value })
                          }
                        />
                        <span>%</span>
                      </label>
                    </div>
                    <small className={styles.optionHint}>
                      {hint}
                      {option.enabled && applied > 0
                        ? ` Applied to ${plural(applied, "villa")} in this quote.`
                        : ""}
                    </small>
                  </div>
                );
              })}
            </div>
            {belowWebsiteRate.length > 0 ? (
              <p className={styles.warn}>
                {belowWebsiteRate.length === 1
                  ? `${belowWebsiteRate[0]} gets`
                  : `${plural(belowWebsiteRate.length, "villa")} get`}{" "}
                less than the website discount ({sitePercents.weekly}% for 7+ nights,{" "}
                {sitePercents.monthly}% for 28+ nights), so the client could find a lower
                price booking online.
              </p>
            ) : null}
            <h3 className={styles.subhead}>Group discount</h3>
            <div className={styles.grid3}>
              <div className={styles.field}>
                <span>Type</span>
                <Segmented
                  label="Discount type"
                  value={discount.type}
                  onChange={(type) => setDiscount((prev) => ({ ...prev, type }))}
                  options={[
                    { value: "percent", label: "Percent %" },
                    { value: "fixed", label: "Fixed $" },
                  ]}
                />
              </div>
              <label className={styles.field}>
                <span>
                  {discount.type === "percent"
                    ? "Percent off"
                    : `Amount off (${displayCurrency})`}
                </span>
                <input
                  type="number"
                  min={0}
                  max={discount.type === "percent" ? 100 : undefined}
                  step={discount.type === "percent" ? 1 : inColones ? 1000 : 10}
                  value={discount.value}
                  placeholder="0"
                  onChange={(event) =>
                    setDiscount((prev) => ({ ...prev, value: event.target.value }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Label on the quote</span>
                <input
                  value={discount.label}
                  onChange={(event) =>
                    setDiscount((prev) => ({ ...prev, label: event.target.value }))
                  }
                />
              </label>
            </div>
            <p className={styles.hint}>
              The group discount comes off after any weekly or monthly discount.
            </p>
          </section>

          <section className={styles.card}>
            <h2>Currency</h2>
            <div className={styles.grid3}>
              <div className={styles.field}>
                <span>PDF prices in</span>
                <Segmented
                  label="Quote currency"
                  value={displayCurrency}
                  onChange={switchCurrency}
                  options={[
                    { value: "USD", label: "USD ($)" },
                    { value: "CRC", label: "CRC (₡)" },
                  ]}
                />
              </div>
              <label className={styles.field}>
                <span>Base exchange rate (CRC per USD)</span>
                <input
                  type="number"
                  min={1}
                  step={0.01}
                  value={rateInput}
                  placeholder="Enter rate"
                  onChange={(event) => setRateInput(event.target.value)}
                />
              </label>
              {exchangeRate?.rate && !rateIsLive ? (
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => setRateInput(String(exchangeRate.rate))}
                >
                  Reset to {exchangeRate.fixed ? "Sanity" : "live"} rate
                </button>
              ) : null}
            </div>
            <p className={styles.hint}>
              {exchangeRate?.rate
                ? `${exchangeRate.fixed ? "Fixed in System Settings" : "Live"}: ${rateLabel(
                    exchangeRate.rate
                  )} per USD${exchangeRate.fixed ? "" : `, ${exchangeRate.source}`}${
                    exchangeRate.date ? `, ${formatStayDate(exchangeRate.date)}` : ""
                  }. Colón prices are USD × base rate × 1.12, rounded to the nearest ₡1,000, the same as the website.`
                : "The rate could not be loaded. Enter a base rate to show colones."}
            </p>
            {rateMissing ? (
              <p className={styles.warn}>Enter an exchange rate to show colones.</p>
            ) : null}
          </section>

          <section className={styles.card}>
            <h2>Export settings</h2>
            <div className={styles.settingsRow}>
              <div className={styles.field}>
                <span>PDF language</span>
                <Segmented
                  label="PDF language"
                  value={lang}
                  onChange={switchLanguage}
                  options={[
                    { value: "en", label: "English" },
                    { value: "es", label: "Español" },
                  ]}
                />
                <small className={styles.optionHint}>
                  Language for the whole PDF, including dates, labels and terms.
                </small>
              </div>
              <div className={styles.field}>
                <span>Phone on the PDF</span>
                <Segmented
                  label="Phone on the PDF"
                  value={selectedPhone.tel}
                  onChange={setPhoneTel}
                  options={phones.map((phone) => ({
                    value: phone.tel,
                    label: `${phoneCountry(phone.tel)} ${phone.label}`,
                  }))}
                />
                <small className={styles.optionHint}>
                  Number the client sees for calls or WhatsApp.
                </small>
              </div>
            </div>
            <div className={styles.optionGroup} role="radiogroup" aria-label="Price display">
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="priceDisplay"
                  checked={priceDisplay === "original"}
                  onChange={() => setPriceDisplay("original")}
                />
                <span>
                  Show original price + applied discount
                  <small className={styles.optionHint}>
                    Shows the full price, the discount and the new total. Good for
                    showing savings.
                  </small>
                </span>
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="priceDisplay"
                  checked={priceDisplay === "net"}
                  onChange={() => setPriceDisplay("net")}
                />
                <span>
                  Show net discounted price only
                  <small className={styles.optionHint}>
                    Shows only the final prices, with no mention of a discount.
                  </small>
                </span>
              </label>
            </div>
            <div className={styles.optionGroup} role="radiogroup" aria-label="Rate detail">
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="rateDetail"
                  checked={rateDetail === "itemized"}
                  onChange={() => setRateDetail("itemized")}
                />
                <span>
                  Itemized nightly rates per villa
                  <small className={styles.optionHint}>
                    Lists each nightly rate and extra guest fee for every villa.
                  </small>
                </span>
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="rateDetail"
                  checked={rateDetail === "total"}
                  onChange={() => setRateDetail("total")}
                />
                <span>
                  One total per villa
                  <small className={styles.optionHint}>
                    One amount per villa. Cleaner for big groups.
                  </small>
                </span>
              </label>
            </div>
            <div className={styles.optionGroup}>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={showExceptions}
                  onChange={(event) => setShowExceptions(event.target.checked)}
                />
                <span>
                  Show special exceptions under each villa
                  <small className={styles.optionHint}>
                    Lists the rules we are bending for this group, like a waived minimum
                    stay, so the client sees the extra value they are getting.
                  </small>
                </span>
              </label>
            </div>
            <div className={styles.feeOptions}>
              {checkoutFees.map((fee) => (
                <label key={fee.feeId} className={styles.check}>
                  <input
                    type="checkbox"
                    checked={!excludedFeeIds.includes(fee.feeId)}
                    onChange={(event) => toggleFee(fee.feeId, event.target.checked)}
                  />
                  <span>
                    Add {withFeeRate(fee.titleEn, fee)}
                    <small className={styles.optionHint}>
                      {fee.perVilla
                        ? "Flat fee set per villa in Sanity, charged once per stay. Same as online bookings."
                        : fee.feeType === "percentage"
                          ? `Same ${fee.amount}% charged on online bookings, on villa rates after discount.`
                          : "Same fee charged on online bookings."}
                    </small>
                  </span>
                </label>
              ))}
              {taxRate > 0 ? (
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={includeTax}
                    onChange={(event) => setIncludeTax(event.target.checked)}
                  />
                  <span>
                    Add {taxTitle} ({taxRate}%)
                    <small className={styles.optionHint}>
                      {`${taxRate}% IVA on ${[
                        "villas",
                        ...checkoutFees.map((fee) => fee.titleEn.toLowerCase()),
                      ].join(", ")} and meals and services.`}
                    </small>
                  </span>
                </label>
              ) : null}
            </div>
          </section>
        </div>

        <aside className={styles.summary}>
          <div className={styles.summaryCard}>
            <h2>Quote summary</h2>
            <dl className={styles.summaryList}>
              <div>
                <dt>Villas</dt>
                <dd>{selections.length}</dd>
              </div>
              <div>
                <dt>Guests</dt>
                <dd>{quote.totalGuests}</dd>
              </div>
            </dl>
            <table className={styles.dualTable}>
              <thead>
                <tr>
                  <th scope="col">
                    <span className={styles.srOnly}>Item</span>
                  </th>
                  <th scope="col">USD</th>
                  {quoteCrc ? <th scope="col">CRC</th> : null}
                </tr>
              </thead>
              <tbody>
                {summaryRows(quoteUsd).map((item) => {
                  const crcItem = quoteCrc
                    ? summaryRows(quoteCrc).find((other) => other.key === item.key)
                    : null;
                  const cell = (amount, format) =>
                    item.discount ? `−${format(amount)}` : format(amount);
                  return (
                    <tr
                      key={item.key}
                      className={item.discount ? styles.dualDiscount : undefined}
                    >
                      <th scope="row">{item.label}</th>
                      <td>{cell(item.amount, (v) => money(v, currency))}</td>
                      {quoteCrc ? (
                        <td>{crcItem ? cell(crcItem.amount, formatCrc) : ""}</td>
                      ) : null}
                    </tr>
                  );
                })}
                <tr className={styles.dualTotal}>
                  <th scope="row">Total</th>
                  <td>{money(quoteUsd.total, currency)}</td>
                  {quoteCrc ? <td>{formatCrc(quoteCrc.total)}</td> : null}
                </tr>
              </tbody>
            </table>
            <p className={styles.hint}>
              The PDF uses {inColones && quoteCrc ? "colones" : "dollars"}. Payment is
              always charged in USD.
            </p>
            {bookedOut.length > 0 ? (
              <p className={styles.warn}>
                ⚠️ Left out because booked:{" "}
                {bookedOut.map((selection) => selection.property.name).join(", ")}.
              </p>
            ) : null}
            {pricedRows.length < selections.length ? (
              <p className={styles.note}>
                {plural(selections.length - pricedRows.length, "villa")} still need dates.
              </p>
            ) : null}
            {downloadError ? <p className={styles.warn}>{downloadError}</p> : null}
            <button
              type="button"
              className={styles.download}
              onClick={handleDownload}
              disabled={downloading || !hasContent || rateMissing}
            >
              {downloading ? "Preparing PDF..." : "Download PDF quote"}
            </button>
            {!hasContent ? (
              <p className={styles.hint}>Pick dates and at least one villa.</p>
            ) : null}
          </div>
        </aside>
      </div>

      <h2 className={styles.previewTitle}>PDF preview</h2>
      <div className={styles.previewScroll}>
        <article
          ref={documentRef}
          className={styles.doc}
          aria-label="Quote preview"
          lang={lang}
        >
          <header className={styles.docHero}>
            <img src="/BannerVilla4.jpg" alt="" className={styles.docHeroImage} />
            <div className={styles.docHeroShade} />
            <div className={styles.docHeroCopy}>
              <img
                src="/blessedhouse_logo25.png"
                alt={brand.brandLine}
                className={styles.docHeroLogo}
              />
              <div>
                <p className={styles.docBrand}>{brand.brandLine}</p>
                <p className={styles.docKicker}>{t.kicker}</p>
              </div>
            </div>
          </header>

          <div className={styles.docBody}>
            <div className={styles.docMeta}>
              <div>
                <span>{t.preparedFor}</span>
                <strong>{client.groupName.trim() || t.defaultGroup}</strong>
                {client.contactName.trim() ? <em>{client.contactName.trim()}</em> : null}
              </div>
              <div>
                <span>{t.quote}</span>
                <strong>{quoteNumber}</strong>
                <em>{issuedIso ? t.issued(docDate(issuedIso)) : ""}</em>
              </div>
              <div>
                <span>{t.validUntil}</span>
                <strong>{validUntil ? docDate(validUntil) : t.onRequest}</strong>
              </div>
            </div>

            {pricedRows.length > 0 ? (
              <div className={styles.docStay}>
                <div>
                  <span>{t.checkIn}</span>
                  <strong>{docDate(stayStart)}</strong>
                </div>
                <div>
                  <span>{t.checkOut}</span>
                  <strong>{docDate(stayEnd)}</strong>
                </div>
                <div>
                  <span>{t.stay}</span>
                  <strong>
                    {sharedDates ? t.nights(pricedRows[0].quote.nights) : t.datesVary}
                  </strong>
                </div>
                <div>
                  <span>{t.group}</span>
                  <strong>
                    <span className={styles.noWrap}>{t.villas(pricedRows.length)} ·</span>{" "}
                    <span className={styles.noWrap}>
                      {t.guests(pricedRows.reduce((sum, row) => sum + row.guests, 0))}
                    </span>
                  </strong>
                </div>
              </div>
            ) : (
              <p className={styles.docEmpty}>{t.empty}</p>
            )}

            {docRows.map((row) => {
              const lines = priceDisplay === "net" ? row.netLines : row.quote.lines;
              const villaTotal =
                priceDisplay === "net" ? row.netSubtotal : row.afterStayDiscount;
              const villaStayDiscount = priceDisplay === "net" ? null : row.stayDiscount;
              const exceptions = villaExceptions(row);
              return (
                <div key={row.property.id} className={styles.docBlock}>
                  <section className={styles.docVilla}>
                    {row.property.photo ? (
                      <img
                        src={row.property.photo}
                        alt={row.property.photoAlt}
                        crossOrigin="anonymous"
                        className={styles.docVillaPhoto}
                      />
                    ) : (
                      <div className={styles.docVillaPhoto} />
                    )}
                    <div className={styles.docVillaBody}>
                      <h3>{row.property.name}</h3>
                      <p className={styles.docVillaMeta}>
                        {t.sleeps(row.property.guestsMax, row.guests)}
                      </p>
                      <p className={styles.docVillaMeta}>
                        {t.dateRange(docDate(row.checkIn), docDate(row.checkOut))} ·{" "}
                        {t.nights(row.quote.nights)}
                      </p>
                      {rateDetail === "itemized" ? (
                        <table className={styles.docLines}>
                          <tbody>
                            {lines.map((line) => (
                              <tr key={`${line.kind}-${line.label}-${line.rate}`}>
                                <td>{lineLabel(line, row.property.seasonalPricing)}</td>
                                <td>{t.lineQty(line.count, docFmt(line.rate))}</td>
                                <td>{docFmt(line.subtotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : null}
                      {villaStayDiscount ? (
                        <p className={styles.docVillaDiscount}>
                          <span>{stayDiscountTitle(villaStayDiscount)}</span>
                          <span>{t.off(docFmt(villaStayDiscount.amount))}</span>
                        </p>
                      ) : null}
                      <p className={styles.docVillaTotal}>
                        <span>{t.villaTotal}</span>
                        <strong>{docFmt(villaTotal)}</strong>
                      </p>
                    </div>
                    {exceptions.length > 0 ? (
                      <div className={styles.docExceptions}>
                        <p>{t.exceptionsTitle}</p>
                        <ul>
                          {exceptions.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </section>
                </div>
              );
            })}

            {docQuote.addOnLines.length > 0 ? (
              <div className={styles.docBlock}>
                <section className={styles.docAddOns}>
                  <h3>{t.addOnsTitle}</h3>
                  <table className={styles.docLines}>
                    <tbody>
                      {docQuote.addOnLines.map((line) => (
                        <tr key={line.id}>
                          <td>{line.name || t.addOnFallback[line.category]}</td>
                          <td>
                            {t.addOnQty(
                              docFmt(line.unitPriceUsd),
                              line.people,
                              line.units,
                              line.category
                            )}
                          </td>
                          <td>{docFmt(line.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              </div>
            ) : null}

            {hasContent ? (
              <div className={styles.docBlock}>
                <section className={styles.docTotals}>
                  {showDiscount ? (
                    <>
                      <p>
                        <span>{t.originalPrice}</span>
                        <span>{docFmt(docQuote.subtotal)}</span>
                      </p>
                      {docQuote.stayDiscountLines.map((line) => (
                        <p
                          key={`${line.kind}-${line.percent}`}
                          className={`${styles.docDiscount} ${styles.docStayDiscount}`}
                        >
                          <span>{stayDiscountTitle(line)}</span>
                          <span>{t.off(docFmt(line.amount))}</span>
                        </p>
                      ))}
                      {docQuote.groupDiscountAmount > 0 ? (
                        <p className={styles.docDiscount}>
                          <span>{discountTitle}</span>
                          <span>{t.off(docFmt(docQuote.groupDiscountAmount))}</span>
                        </p>
                      ) : null}
                    </>
                  ) : null}
                  {docRows.length > 0 &&
                  (docQuote.addOnLines.length > 0 ||
                    docQuote.feeLines.length > 0 ||
                    docQuote.taxes > 0) ? (
                    <p>
                      <span>{t.accommodation}</span>
                      <span>{docFmt(docQuote.netSubtotal)}</span>
                    </p>
                  ) : null}
                  {docQuote.addOnLines.length > 0 ? (
                    <p>
                      <span>{t.addOnsTitle}</span>
                      <span>{docFmt(docQuote.addOnsTotal)}</span>
                    </p>
                  ) : null}
                  {docQuote.feeLines.length > 0 || docQuote.taxes > 0 ? (
                    <>
                      {docQuote.feeLines.map((line) => (
                        <p key={line.feeId}>
                          <span>{withFeeRate(feeTitle(line), line)}</span>
                          <span>{docFmt(line.subtotal)}</span>
                        </p>
                      ))}
                      {docQuote.taxes > 0 ? (
                        <p>
                          <span>
                            {t.taxLabel(settings)} ({docQuote.taxRate}%)
                          </span>
                          <span>{docFmt(docQuote.taxes)}</span>
                        </p>
                      ) : null}
                    </>
                  ) : null}
                  <p className={styles.docGrandTotal}>
                    <span>{t.total}</span>
                    <span>{docFmt(docQuote.total)}</span>
                  </p>
                  <p className={styles.docFine}>
                    {inColones && quoteCrc ? t.pricesInColones : t.pricesIn(currency)}
                    {docQuote.cleaningIncluded > 0 ? t.includesCleaning : ""}
                    {leftOff.length > 0 ? t.notIncluded(leftOff) : ""}
                  </p>
                </section>
              </div>
            ) : null}

            {client.notes.trim() ? (
              <div className={styles.docBlock}>
                <section className={styles.docNotes}>
                  <h4>{t.notes}</h4>
                  <p>{client.notes.trim()}</p>
                </section>
              </div>
            ) : null}

            <div className={styles.docBlock}>
              <p className={styles.docTerms}>
                {t.terms(validUntil ? docDate(validUntil) : "")}
              </p>
            </div>
          </div>

          <div className={styles.docBlock}>
            <footer className={styles.docFooter}>
              <div>
                <strong>{brand.contactName}</strong>
                <span>{selectedPhone.label}</span>
                <span>{contactEmail}</span>
              </div>
              <div>
                <strong>{brand.brandLine}</strong>
                <span>{brand.contactWeb}</span>
                <span>{brand.contactLocation}</span>
              </div>
            </footer>
          </div>
        </article>
      </div>
    </div>
  );
}
