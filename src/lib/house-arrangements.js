/**
 * Turns booking engine house arrangements into translated room rows:
 * [{ title: "Bedroom 1", beds: "1 King Bed + 1 Single Bed", capacity: 3 }].
 * Room types only carry English and Spanish text, so bed names are parsed from
 * the English config and translated here for every site language.
 */

const COPY = {
  en: {
    bedroom: "Bedroom",
    livingRoom: "Living room",
    beds: {
      king: ["King Bed", "King Beds"],
      queen: ["Queen Bed", "Queen Beds"],
      double: ["Double Bed", "Double Beds"],
      single: ["Single Bed", "Single Beds"],
      bunk: ["Bunk Bed", "Bunk Beds"],
      sofa: ["Sofa Bed", "Sofa Beds"],
    },
  },
  es: {
    bedroom: "Dormitorio",
    livingRoom: "Sala",
    beds: {
      king: ["Cama King", "Camas King"],
      queen: ["Cama Queen", "Camas Queen"],
      double: ["Cama Doble", "Camas Dobles"],
      single: ["Cama Individual", "Camas Individuales"],
      bunk: ["Litera", "Literas"],
      sofa: ["Sofá Cama", "Sofás Cama"],
    },
  },
  de: {
    bedroom: "Schlafzimmer",
    livingRoom: "Wohnzimmer",
    beds: {
      king: ["King Bett", "King Betten"],
      queen: ["Queen Bett", "Queen Betten"],
      double: ["Doppelbett", "Doppelbetten"],
      single: ["Einzelbett", "Einzelbetten"],
      bunk: ["Etagenbett", "Etagenbetten"],
      sofa: ["Sofabett", "Sofabetten"],
    },
  },
  nl: {
    bedroom: "Slaapkamer",
    livingRoom: "Woonkamer",
    beds: {
      king: ["King Bed", "King Beds"],
      queen: ["Queen Bed", "Queen Beds"],
      double: ["Tweepersoonsbed", "Tweepersoonsbedden"],
      single: ["Eenpersoonsbed", "Eenpersoonsbedden"],
      bunk: ["Stapelbed", "Stapelbedden"],
      sofa: ["Slaapbank", "Slaapbanken"],
    },
  },
  fr: {
    bedroom: "Chambre",
    livingRoom: "Salon",
    beds: {
      king: ["Lit King", "Lits King"],
      queen: ["Lit Queen", "Lits Queen"],
      double: ["Lit Double", "Lits Doubles"],
      single: ["Lit Simple", "Lits Simples"],
      bunk: ["Lit Superposé", "Lits Superposés"],
      sofa: ["Canapé Lit", "Canapés Lits"],
    },
  },
  ja: {
    bedroom: "寝室",
    livingRoom: "リビング",
    beds: {
      king: ["キングベッド"],
      queen: ["クイーンベッド"],
      double: ["ダブルベッド"],
      single: ["シングルベッド"],
      bunk: ["二段ベッド"],
      sofa: ["ソファベッド"],
    },
  },
  pt: {
    bedroom: "Quarto",
    livingRoom: "Sala de estar",
    beds: {
      king: ["Cama King", "Camas King"],
      queen: ["Cama Queen", "Camas Queen"],
      double: ["Cama de Casal", "Camas de Casal"],
      single: ["Cama Individual", "Camas Individuais"],
      bunk: ["Beliche", "Beliches"],
      sofa: ["Sofá Cama", "Sofás Cama"],
    },
  },
  ar: {
    bedroom: "غرفة النوم",
    livingRoom: "غرفة المعيشة",
    beds: {
      king: ["سرير كينغ", "أسرّة كينغ"],
      queen: ["سرير كوين", "أسرّة كوين"],
      double: ["سرير مزدوج", "أسرّة مزدوجة"],
      single: ["سرير مفرد", "أسرّة مفردة"],
      bunk: ["سرير بطابقين", "أسرّة بطابقين"],
      sofa: ["أريكة سرير", "أرائك سرير"],
    },
  },
};

const BED_PATTERN = /^(\d+)\s+(king|queen|double|single|twin|bunk|sofa)\s+beds?$/i;

function formatBed(count, kind, copy, language) {
  const [singular, plural = singular] = copy.beds[kind];
  if (language === "ja") return `${singular}${count}台`;
  if (language === "ar") return count === 1 ? singular : `${count} ${plural}`;
  return `${count} ${count === 1 ? singular : plural}`;
}

function translateBeds(configEn, fallback, copy, language) {
  const parts = String(configEn || "").split("+").map((part) => part.trim());
  const beds = [];
  for (const part of parts) {
    const match = part.match(BED_PATTERN);
    if (!match) return fallback || configEn || "";
    const kind = match[2].toLowerCase() === "twin" ? "single" : match[2].toLowerCase();
    beds.push(formatBed(Number(match[1]), kind, copy, language));
  }
  return beds.join(" + ");
}

function isLivingRoom(row) {
  const title = `${row.customTitleEn || ""} ${row.roomType?.titleEn || ""}`;
  return /living|sofa/i.test(title);
}

export function buildRoomRows(arrangements, language = "en") {
  const copy = COPY[language] || COPY.en;
  const expanded = [];
  for (const row of Array.isArray(arrangements) ? arrangements : []) {
    const quantity = Math.max(1, Math.floor(Number(row?.quantity) || 1));
    for (let i = 0; i < quantity; i += 1) expanded.push(row);
  }
  const bedroomTotal = expanded.filter((row) => !isLivingRoom(row)).length;
  let bedroomIndex = 0;

  return expanded.map((row) => {
    const living = isLivingRoom(row);
    if (!living) bedroomIndex += 1;
    const title = living
      ? copy.livingRoom
      : bedroomTotal > 1
        ? `${copy.bedroom}${language === "ja" ? "" : " "}${bedroomIndex}`
        : copy.bedroom;
    const fallback = language === "es" ? row.roomType?.configEs : row.roomType?.configEn;
    return {
      title,
      beds: translateBeds(row.roomType?.configEn, fallback, copy, language),
      capacity: Number(row.roomType?.capacity) || null,
    };
  });
}
