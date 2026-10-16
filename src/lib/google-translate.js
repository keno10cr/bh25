const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function dehyphenate(text) {
  return String(text || "")
    .replace(/\u2013|\u2014/g, ",")
    .replace(/(\w)-(\w)/g, "$1 $2");
}

/**
 * Machine-translate English text. Same public endpoint as the blog script.
 * Source language is always English.
 */
export async function translateText(text, target) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return "";

  const chunks = [];
  let remaining = trimmed;
  while (remaining.length > 1400) {
    let cut = remaining.lastIndexOf(" ", 1400);
    if (cut < 400) cut = 1400;
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) chunks.push(remaining);

  const out = [];
  for (const chunk of chunks) {
    let attempt = 0;
    while (true) {
      attempt += 1;
      const url =
        "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=" +
        encodeURIComponent(target) +
        "&dt=t&q=" +
        encodeURIComponent(chunk);
      try {
        const res = await fetch(url);
        if (res.status === 429 || res.status === 503) {
          const waitMs = Math.min(60000, 5000 * attempt);
          console.warn(
            `Rate limited (${res.status}). Waiting ${Math.round(waitMs / 1000)}s...`
          );
          await sleep(waitMs);
          if (attempt >= 8) throw new Error(`Translate HTTP ${res.status}`);
          continue;
        }
        if (!res.ok) throw new Error(`Translate HTTP ${res.status}`);
        const data = await res.json();
        const translated = Array.isArray(data?.[0])
          ? data[0].map((part) => part?.[0] || "").join("")
          : chunk;
        out.push(dehyphenate(translated));
        await sleep(150);
        break;
      } catch (error) {
        const waitMs = Math.min(45000, 3000 * attempt);
        console.warn(
          `Translate failed (${error.cause?.code || error.message}). Retry in ${Math.round(waitMs / 1000)}s...`
        );
        await sleep(waitMs);
        if (attempt >= 8) throw error;
      }
    }
  }
  return out.join(" ");
}
