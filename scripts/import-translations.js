/**
 * Import translated locale strings from a master JSON file into Sanity.
 * Only writes non-empty locale values (never overwrites English source fields).
 *
 * Usage:
 *   pnpm i18n:import
 *   pnpm i18n:import -- --in=./translations/sanity-translations.json
 *   pnpm i18n:import -- --in=./translations/sanity-translations.json --dry-run
 *   pnpm i18n:import -- --locales=es,nl --types=blog
 *
 * Requires SANITY_API_WRITE_TOKEN or Sanity CLI login
 * (`sanity exec ... --with-user-token`).
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";
import {
  ARRAY_FIELDS,
  DOCUMENT_FIELDS,
  LOCALES,
  textToBlocks,
} from "./i18n-config.js";

function parseArgs(argv) {
  const args = {
    input: "translations/sanity-translations.json",
    dryRun: false,
    locales: null,
    types: null,
  };
  for (const raw of argv) {
    if (raw.startsWith("--in=")) args.input = raw.slice(5);
    if (raw === "--dry-run") args.dryRun = true;
    if (raw.startsWith("--locales=")) {
      args.locales = raw
        .slice(10)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (raw.startsWith("--types=")) {
      args.types = raw
        .slice(8)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return args;
}

async function getClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (token) {
    return createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      token,
      useCdn: false,
    });
  }
  const { getCliClient } = await import("sanity/cli");
  return getCliClient({ apiVersion: sanityApiVersion });
}

function localeSuffix(code) {
  return LOCALES.find((locale) => locale.code === code)?.suffix;
}

function valueForKind(kind, text, keyPrefix) {
  if (text == null) return undefined;
  const trimmed = String(text).trim();
  if (!trimmed) return undefined;
  if (kind === "blocks") return textToBlocks(trimmed, keyPrefix);
  return trimmed;
}

function collectFieldPatches(fields, allowedLocales, keyPrefix) {
  const patch = {};
  if (!fields || typeof fields !== "object") return patch;

  for (const [fieldName, bag] of Object.entries(fields)) {
    if (!bag || typeof bag !== "object") continue;
    const kind = bag.kind || "string";
    for (const locale of allowedLocales) {
      if (locale === "en") continue;
      const suffix = localeSuffix(locale);
      if (!suffix) continue;
      const next = valueForKind(
        kind,
        bag[locale],
        `${keyPrefix}-${fieldName}-${locale}`
      );
      if (next === undefined) continue;
      patch[`${fieldName}${suffix}`] = next;
    }
  }
  return patch;
}

async function importDocument(client, doc, allowedLocales, dryRun) {
  const fieldDefs = DOCUMENT_FIELDS[doc._type];
  if (!fieldDefs) {
    console.warn(`Skipping unsupported type ${doc._type} (${doc._id})`);
    return { patched: false, fields: 0 };
  }

  const patch = collectFieldPatches(
    doc.fields,
    allowedLocales,
    `${doc._id}-root`
  );

  // Nested arrays: set full array items with locale companions merged in.
  const arrayDefs = ARRAY_FIELDS[doc._type] || [];
  if (arrayDefs.length && doc.arrays) {
    const existing = await client.fetch(`*[_id == $id][0]`, { id: doc._id });
    if (!existing) {
      console.warn(`Document not found: ${doc._id}`);
      return { patched: false, fields: 0 };
    }

    for (const arrayDef of arrayDefs) {
      const exportedItems = doc.arrays?.[arrayDef.name];
      if (!Array.isArray(exportedItems) || !exportedItems.length) continue;

      const currentItems = Array.isArray(existing[arrayDef.name])
        ? existing[arrayDef.name]
        : [];

      const nextItems = currentItems.map((item) => {
        const match =
          exportedItems.find((row) => row._key && row._key === item._key) ||
          exportedItems.find(
            (row) =>
              arrayDef.meta?.includes("slug") &&
              row.meta?.slug &&
              row.meta.slug === item.slug
          );
        if (!match) return item;

        const updated = { ...item };
        for (const field of arrayDef.fields) {
          const bag = match.fields?.[field.name];
          if (!bag) continue;
          for (const locale of allowedLocales) {
            if (locale === "en") continue;
            const suffix = localeSuffix(locale);
            if (!suffix) continue;
            const next = valueForKind(
              field.kind,
              bag[locale],
              `${doc._id}-${arrayDef.name}-${item._key || "x"}-${field.name}-${locale}`
            );
            if (next === undefined) continue;
            updated[`${field.name}${suffix}`] = next;
          }
        }
        return updated;
      });

      // Detect change
      const changed =
        JSON.stringify(nextItems) !== JSON.stringify(currentItems);
      if (changed) patch[arrayDef.name] = nextItems;
    }
  }

  const keys = Object.keys(patch);
  if (!keys.length) return { patched: false, fields: 0 };

  if (dryRun) {
    console.log(`[dry-run] ${doc._id} ← ${keys.join(", ")}`);
    return { patched: true, fields: keys.length };
  }

  await client
    .patch(doc._id)
    .set(patch)
    .commit({ autoGenerateArrayKeys: true });
  console.log(`Updated ${doc._id} (${keys.length} fields)`);
  return { patched: true, fields: keys.length };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(process.cwd(), args.input);
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const payload = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  if (!payload?.documents || !Array.isArray(payload.documents)) {
    throw new Error("Invalid export file: missing documents[]");
  }

  const allowedLocales = args.locales?.length
    ? args.locales
    : LOCALES.map((l) => l.code);
  const allowedTypes = args.types?.length ? new Set(args.types) : null;

  const client = await getClient();
  let patchedDocs = 0;
  let patchedFields = 0;

  for (const doc of payload.documents) {
    if (allowedTypes && !allowedTypes.has(doc._type)) continue;
    const result = await importDocument(
      client,
      doc,
      allowedLocales,
      args.dryRun
    );
    if (result.patched) {
      patchedDocs += 1;
      patchedFields += result.fields;
    }
  }

  console.log(
    `${args.dryRun ? "Dry run complete" : "Import complete"}: ${patchedDocs} documents, ${patchedFields} fields.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
