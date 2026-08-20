/**
 * Translate blog title/excerpt/content into Sanity locale fields.
 * Uses the public Google Translate endpoint (no API key).
 *
 * Usage: pnpm translate:blog
 * Safe to re-run: skips fields that are already filled.
 */
import { getCliClient } from "sanity/cli";
import { sanityApiVersion } from "../sanity/env.js";

const LOCALES = [
  { code: "es", suffix: "Es", target: "es" },
  { code: "de", suffix: "De", target: "de" },
  { code: "nl", suffix: "Nl", target: "nl" },
  { code: "fr", suffix: "Fr", target: "fr" },
  { code: "ja", suffix: "Ja", target: "ja" },
  { code: "pt", suffix: "Pt", target: "pt" },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function blocksToText(blocks) {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (block._type !== "block" || !Array.isArray(block.children)) return "";
      return block.children.map((child) => child.text || "").join("");
    })
    .filter(Boolean)
    .join("\n\n");
}

function textToBlocks(text, prefix) {
  return String(text || "")
    .split(/\n\n+/)
    .filter(Boolean)
    .map((paragraph, index) => ({
      _type: "block",
      _key: `${prefix}-${index}`,
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: `${prefix}-s${index}`,
          text: paragraph,
          marks: [],
        },
      ],
    }));
}

function dehyphenate(text) {
  return String(text || "")
    .replace(/\u2013|\u2014/g, ",")
    .replace(/(\w)-(\w)/g, "$1 $2");
}

function isFilledContent(value) {
  return Array.isArray(value) && value.length > 0;
}

async function translateText(text, target) {
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

async function main() {
  const client = getCliClient({ apiVersion: sanityApiVersion });
  const posts = await client.fetch(`*[_type == "blog"] | order(publishedAt asc) {
    _id,
    title,
    excerpt,
    content,
    titleEs, titleDe, titleNl, titleFr, titleJa, titlePt,
    excerptEs, excerptDe, excerptNl, excerptFr, excerptJa, excerptPt,
    contentEs, contentDe, contentNl, contentFr, contentJa, contentPt
  }`);

  console.log(`Translating ${posts.length} posts (resume safe)...`);

  for (let i = 0; i < posts.length; i += 1) {
    const post = posts[i];
    const patch = {};
    const englishBody = blocksToText(post.content);
    console.log(`[${i + 1}/${posts.length}] ${post._id}`);

    for (const locale of LOCALES) {
      const titleKey = `title${locale.suffix}`;
      const excerptKey = `excerpt${locale.suffix}`;
      const contentKey = `content${locale.suffix}`;

      if (!post[titleKey] && post.title) {
        patch[titleKey] = await translateText(post.title, locale.target);
      }
      if (!post[excerptKey] && post.excerpt) {
        patch[excerptKey] = await translateText(post.excerpt, locale.target);
      }
      if (!isFilledContent(post[contentKey]) && englishBody) {
        const paragraphs = englishBody.split(/\n\n+/).filter(Boolean);
        const translatedParas = [];
        for (const paragraph of paragraphs) {
          translatedParas.push(
            await translateText(paragraph, locale.target)
          );
        }
        patch[contentKey] = textToBlocks(
          translatedParas.join("\n\n"),
          `${post._id}-${locale.code}`
        );
      }
    }

    if (Object.keys(patch).length) {
      let attempt = 0;
      while (true) {
        attempt += 1;
        try {
          await client
            .patch(post._id)
            .set(patch)
            .commit({ autoGenerateArrayKeys: true });
          console.log(`  saved (${Object.keys(patch).length} fields)`);
          break;
        } catch (error) {
          const waitMs = Math.min(60000, 4000 * attempt);
          console.warn(
            `  Sanity save failed (${error.cause?.code || error.message}). Retry in ${Math.round(waitMs / 1000)}s...`
          );
          await sleep(waitMs);
          if (attempt >= 8) throw error;
        }
      }
    } else {
      console.log("  skipped (already filled)");
    }
  }

  console.log("Blog locale fill complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
