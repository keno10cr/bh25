const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

export const ADD_ON_PRESETS = [
  { key: "breakfast", category: "meal", en: "Breakfast", es: "Desayuno" },
  { key: "lunch", category: "meal", en: "Lunch", es: "Almuerzo" },
  { key: "dinner", category: "meal", en: "Dinner", es: "Cena" },
  { key: "tour", category: "service", en: "Tour", es: "Tour" },
  { key: "transportation", category: "service", en: "Transportation", es: "Transporte" },
  { key: "cleaning", category: "service", en: "Extra cleaning", es: "Limpieza adicional" },
];

function joinList(items, conjunction) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${conjunction} ${items[items.length - 1]}`;
}

function addOnQty(price, people, units, category, words) {
  const parts = [price, plural(people, words.person, words.people)];
  if (category === "meal") parts.push(plural(units, words.day, words.days));
  else if (units !== 1) parts.push(plural(units, words.time, words.times));
  return parts.join(" × ");
}

export const QUOTE_COPY = {
  en: {
    locale: "en-US",
    kicker: "Group Reservation Quote",
    preparedFor: "Prepared for",
    defaultGroup: "Your group",
    quote: "Quote",
    issued: (date) => `Issued ${date}`,
    validUntil: "Valid until",
    onRequest: "On request",
    checkIn: "Check in",
    checkOut: "Check out",
    stay: "Stay",
    group: "Group",
    nights: (n) => plural(n, "night", "nights"),
    villas: (n) => plural(n, "villa", "villas"),
    guests: (n) => plural(n, "guest", "guests"),
    datesVary: "Dates vary by villa",
    empty: "Choose dates and villas above to build the quote.",
    sleeps: (cap, guests) => `Sleeps ${cap} · Quoted for ${plural(guests, "guest", "guests")}`,
    dateRange: (from, to) => `${from} to ${to}`,
    standardRate: "Standard rate",
    extraGuests: (n) => `Extra guests (${n})`,
    lineQty: (n, rate) => `${plural(n, "night", "nights")} × ${rate}`,
    villaTotal: "Villa total",
    exceptionsTitle: "Special exceptions for your group",
    minStayWaived: (min, nights) =>
      `${nights} night stay approved (standard ${min} night minimum removed).`,
    originalPrice: "Original price",
    defaultDiscountLabel: "Group discount",
    stayDiscount: (kind, percent) =>
      `${kind === "monthly" ? "Monthly" : "Weekly"} stay discount (${percent}%)`,
    off: (amount) => `${amount} off`,
    accommodation: "Accommodation",
    addOnsTitle: "Meals and services",
    addOnFallback: { meal: "Meal", service: "Service" },
    addOnQty: (price, people, units, category) =>
      addOnQty(price, people, units, category, {
        person: "person",
        people: "people",
        day: "day",
        days: "days",
        time: "time",
        times: "times",
      }),
    taxLabel: (settings) => settings.taxLabelEn || "Tax",
    total: "Total",
    pricesIn: (currency) => `All prices in ${currency}.`,
    pricesInColones: "All prices in Costa Rican colones (CRC).",
    notIncluded: (items) =>
      ` ${joinList(
        items.map((item, i) => (i === 0 ? item : item.charAt(0).toLowerCase() + item.slice(1))),
        "and"
      )} ${items.length === 1 ? "is" : "are"} not included.`,
    notes: "Notes",
    terms: (date) =>
      date
        ? `This quote is valid until ${date} and is subject to availability at the time of booking.`
        : "This quote is subject to availability at the time of booking.",
    filename: "Blessed-House-Group-Quote",
  },
  es: {
    locale: "es-CR",
    kicker: "Cotización de Reserva Grupal",
    preparedFor: "Preparada para",
    defaultGroup: "Su grupo",
    quote: "Cotización",
    issued: (date) => `Emitida el ${date}`,
    validUntil: "Válida hasta",
    onRequest: "A solicitud",
    checkIn: "Entrada",
    checkOut: "Salida",
    stay: "Estadía",
    group: "Grupo",
    nights: (n) => plural(n, "noche", "noches"),
    villas: (n) => plural(n, "villa", "villas"),
    guests: (n) => plural(n, "huésped", "huéspedes"),
    datesVary: "Las fechas varían por villa",
    empty: "Elija las fechas y las villas para armar la cotización.",
    sleeps: (cap, guests) =>
      `Capacidad ${cap} · Cotizada para ${plural(guests, "huésped", "huéspedes")}`,
    dateRange: (from, to) => `${from} al ${to}`,
    standardRate: "Tarifa estándar",
    extraGuests: (n) => `Huéspedes adicionales (${n})`,
    lineQty: (n, rate) => `${plural(n, "noche", "noches")} × ${rate}`,
    villaTotal: "Total de la villa",
    exceptionsTitle: "Excepciones para su grupo",
    minStayWaived: (min) =>
      `Excepción especial: Mínimo de ${plural(min, "noche", "noches")} omitido para esta estadía.`,
    originalPrice: "Precio original",
    defaultDiscountLabel: "Descuento grupal",
    stayDiscount: (kind, percent) =>
      `Descuento por estadía ${kind === "monthly" ? "mensual" : "semanal"} (${percent}%)`,
    off: (amount) => `${amount} desc.`,
    accommodation: "Hospedaje",
    addOnsTitle: "Comidas y servicios",
    addOnFallback: { meal: "Comida", service: "Servicio" },
    addOnQty: (price, people, units, category) =>
      addOnQty(price, people, units, category, {
        person: "persona",
        people: "personas",
        day: "día",
        days: "días",
        time: "vez",
        times: "veces",
      }),
    taxLabel: () => "IVA",
    total: "Total",
    pricesIn: (currency) => `Todos los precios en ${currency}.`,
    pricesInColones: "Todos los precios en colones costarricenses (CRC).",
    notIncluded: (items) =>
      ` No incluye ${joinList(
        items.map((item) => (item === "IVA" ? item : item.charAt(0).toLowerCase() + item.slice(1))),
        "ni"
      )}.`,
    notes: "Notas",
    terms: (date) =>
      date
        ? `Esta cotización es válida hasta el ${date} y está sujeta a disponibilidad al momento de reservar.`
        : "Esta cotización está sujeta a disponibilidad al momento de reservar.",
    filename: "Cotizacion-Grupal-Blessed-House",
  },
};
