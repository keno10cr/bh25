/**
 * Live USD to CRC rate. Primary: BCCR reference selling rate published by
 * Ministerio de Hacienda. Fallback: open.er-api.com market rate.
 */

const HACIENDA_URL = "https://api.hacienda.go.cr/indicadores/tc/dolar";
const FALLBACK_URL = "https://open.er-api.com/v6/latest/USD";
const REVALIDATE_SECONDS = 3600;

async function fetchJson(url) {
  const response = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error(`${url} responded ${response.status}`);
  return response.json();
}

function validRate(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 100 && n < 2000 ? Math.round(n * 100) / 100 : null;
}

export async function getUsdToCrcRate() {
  try {
    const data = await fetchJson(HACIENDA_URL);
    const rate = validRate(data?.venta?.valor);
    if (rate) {
      return {
        rate,
        source: "BCCR reference selling rate",
        sourceEs: "tipo de cambio de referencia de venta del BCCR",
        date: data.venta.fecha || null,
      };
    }
  } catch (error) {
    console.error("[exchangeRate] Hacienda", error);
  }

  try {
    const data = await fetchJson(FALLBACK_URL);
    const rate = validRate(data?.rates?.CRC);
    if (rate) {
      return {
        rate,
        source: "Market rate (open.er-api.com)",
        sourceEs: "tipo de cambio de mercado (open.er-api.com)",
        date: data.time_last_update_unix
          ? new Date(data.time_last_update_unix * 1000).toISOString().slice(0, 10)
          : null,
      };
    }
  } catch (error) {
    console.error("[exchangeRate] fallback", error);
  }

  return null;
}

/** Base rate for colón prices: the fixed rate from System Settings when set, else the live rate. */
export async function getCrcBaseRate(settings) {
  const fixed = Number(settings?.crcBaseRate);
  if (Number.isFinite(fixed) && fixed > 0) {
    return {
      rate: fixed,
      source: "Fixed base rate (System Settings)",
      sourceEs: "tipo de cambio base fijo (System Settings)",
      date: null,
      fixed: true,
    };
  }
  const live = await getUsdToCrcRate();
  return live ? { ...live, fixed: false } : null;
}
