"use client";

import { useMemo, useState } from "react";
import { tomorrowIsoDate } from "@/lib/availabilityDates";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./date-range-picker.module.css";

const COPY = {
  en: {
    selectDates: "Select dates",
    close: "Close",
    previousMonth: "Previous Month",
    nextMonth: "Next Month",
    confirmDates: "Confirm dates",
    checkIn: "Check in",
    checkOut: "Check out",
    selectDate: "Select date",
    clearRange: "Clear this range",
    to: "to",
  },
  es: {
    selectDates: "Seleccione las fechas",
    close: "Cerrar",
    previousMonth: "Mes anterior",
    nextMonth: "Mes siguiente",
    confirmDates: "Confirmar fechas",
    checkIn: "Llegada",
    checkOut: "Salida",
    selectDate: "Elegir fecha",
    clearRange: "Borrar este rango",
    to: "al",
  },
  de: {
    selectDates: "Daten auswählen",
    close: "Schließen",
    previousMonth: "Vorheriger Monat",
    nextMonth: "Nächster Monat",
    confirmDates: "Daten bestätigen",
    checkIn: "Anreise",
    checkOut: "Abreise",
    selectDate: "Datum wählen",
    clearRange: "Zeitraum löschen",
    to: "bis",
  },
  nl: {
    selectDates: "Kies data",
    close: "Sluiten",
    previousMonth: "Vorige maand",
    nextMonth: "Volgende maand",
    confirmDates: "Data bevestigen",
    checkIn: "Aankomst",
    checkOut: "Vertrek",
    selectDate: "Kies datum",
    clearRange: "Periode wissen",
    to: "tot",
  },
  fr: {
    selectDates: "Choisir les dates",
    close: "Fermer",
    previousMonth: "Mois précédent",
    nextMonth: "Mois suivant",
    confirmDates: "Confirmer les dates",
    checkIn: "Arrivée",
    checkOut: "Départ",
    selectDate: "Choisir une date",
    clearRange: "Effacer cette période",
    to: "au",
  },
  ja: {
    selectDates: "日程を選択",
    close: "閉じる",
    previousMonth: "前の月",
    nextMonth: "次の月",
    confirmDates: "日程を確定",
    checkIn: "チェックイン",
    checkOut: "チェックアウト",
    selectDate: "日付を選択",
    clearRange: "この期間をクリア",
    to: "〜",
  },
  pt: {
    selectDates: "Selecione as datas",
    close: "Fechar",
    previousMonth: "Mês anterior",
    nextMonth: "Próximo mês",
    confirmDates: "Confirmar datas",
    checkIn: "Chegada",
    checkOut: "Saída",
    selectDate: "Escolher data",
    clearRange: "Limpar este período",
    to: "a",
  },
  ar: {
    selectDates: "اختر التواريخ",
    close: "إغلاق",
    previousMonth: "الشهر السابق",
    nextMonth: "الشهر التالي",
    confirmDates: "تأكيد التواريخ",
    checkIn: "الوصول",
    checkOut: "المغادرة",
    selectDate: "اختر التاريخ",
    clearRange: "مسح هذه الفترة",
    to: "إلى",
  },
};

const LOCALE_TAGS = {
  en: "en-US",
  es: "es-CR",
  de: "de-DE",
  nl: "nl-NL",
  fr: "fr-FR",
  ja: "ja-JP",
  pt: "pt-BR",
  ar: "ar",
};

function copyFor(language) {
  return COPY[language] || COPY.en;
}

function localeFor(language) {
  return LOCALE_TAGS[language] || LOCALE_TAGS.en;
}

function weekdayLabels(locale) {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  // 2023-01-01 was a Sunday
  return Array.from({ length: 7 }, (_, i) =>
    formatter.format(new Date(2023, 0, 1 + i))
  );
}

function monthLabel(year, monthIndex, locale) {
  const label = new Date(year, monthIndex, 1).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toLocaleUpperCase(locale) + label.slice(1);
}

function parseLocalIso(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toLocalIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(iso, language = "en") {
  const date = parseLocalIso(iso);
  if (!date) return copyFor(language).selectDate;
  return date.toLocaleDateString(localeFor(language), {
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
  locale,
  weekdays,
}) {
  const cells = buildMonthCells(year, monthIndex);
  return (
    <div className={styles.calendarMonth}>
      <h4>{monthLabel(year, monthIndex, locale)}</h4>
      <div className={styles.weekdays}>
        {weekdays.map((day) => (
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

export function formatRangeLabel(range, language = "en") {
  if (!range?.checkIn || !range?.checkOut) return "";
  return `${formatDisplayDate(range.checkIn, language)} ${copyFor(language).to} ${formatDisplayDate(range.checkOut, language)}`;
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
  const { language } = useLanguage();
  const copy = copyFor(language);
  const locale = localeFor(language);
  const weekdays = useMemo(() => weekdayLabels(locale), [locale]);
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
          <span>{copy.checkIn}</span>
          <strong>{formatDisplayDate(checkIn, language)}</strong>
        </button>
        <button type="button" className={styles.dateBtn} onClick={openModal}>
          <span>{copy.checkOut}</span>
          <strong>{formatDisplayDate(checkOut, language)}</strong>
        </button>
      </div>
      {checkIn && checkOut && onClear ? (
        <button type="button" className={styles.clearBtn} onClick={onClear}>
          {copy.clearRange}
        </button>
      ) : null}
      {error ? <span className={styles.error}>{error}</span> : null}

      {open ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{copy.selectDates}</h3>
              <button type="button" onClick={() => setOpen(false)}>
                {copy.close}
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
                locale={locale}
                weekdays={weekdays}
              />
              <CalendarMonth
                year={nextMonth.year}
                monthIndex={nextMonth.month}
                minIso={minIso}
                checkIn={draftIn}
                checkOut={draftOut}
                onDayClick={handleDayClick}
                locale={locale}
                weekdays={weekdays}
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
                {copy.previousMonth}
              </button>
              <button
                type="button"
                className={styles.confirmDates}
                disabled={!draftIn || !draftOut}
                onClick={confirm}
              >
                {copy.confirmDates}
              </button>
              <button
                type="button"
                onClick={() =>
                  setVisibleMonth((prev) =>
                    shiftMonth(prev.year, prev.month, 1)
                  )
                }
              >
                {copy.nextMonth}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
