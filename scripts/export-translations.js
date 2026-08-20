/**
 * Export English (+ existing locale) copy from Sanity into a master JSON file.
 *
 * Usage:
 *   pnpm i18n:export
 *   pnpm i18n:export -- --out=./translations/export.json
 *   pnpm i18n:export -- --types=blog,villa
 *
 * Requires SANITY_API_WRITE_TOKEN (read also works with a viewer token) or
 * Sanity CLI login via `sanity exec ... --with-user-token`.
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
  EXPORTABLE_TYPES,
  LOCALES,
  readLocalizedValue,
} from "./i18n-config.js";

function parseArgs(argv) {
  const args = { out: "translations/sanity-translations.json", types: null };
  for (const raw of argv) {
    if (raw.startsWith("--out=")) args.out = raw.slice(6);
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

function exportDocument(doc) {
  const fieldDefs = DOCUMENT_FIELDS[doc._type] || [];
  const fields = {};
  for (const field of fieldDefs) {
    fields[field.name] = {
      kind: field.kind,
      ...readLocalizedValue(doc, field.name, field.kind),
    };
  }

  const arrays = {};
  const arrayDefs = ARRAY_FIELDS[doc._type] || [];
  for (const arrayDef of arrayDefs) {
    const items = Array.isArray(doc[arrayDef.name]) ? doc[arrayDef.name] : [];
    arrays[arrayDef.name] = items.map((item) => {
      const entry = {
        _key: item._key,
        meta: {},
        fields: {},
      };
      for (const key of arrayDef.meta || []) {
        entry.meta[key] = item[key] || "";
      }
      for (const field of arrayDef.fields) {
        entry.fields[field.name] = {
          kind: field.kind,
          ...readLocalizedValue(item, field.name, field.kind),
        };
      }
      return entry;
    });
  }

  return {
    _id: doc._id,
    _type: doc._type,
    slug: doc.slug?.current || doc.slug || null,
    label:
      doc.title ||
      doc.name ||
      doc.guestName ||
      doc.heroTitle ||
      doc._id,
    fields,
    arrays: Object.keys(arrays).length ? arrays : undefined,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const types = args.types?.length
    ? args.types.filter((type) => EXPORTABLE_TYPES.includes(type))
    : EXPORTABLE_TYPES;

  if (!types.length) {
    throw new Error(
      `No valid types. Allowed: ${EXPORTABLE_TYPES.join(", ")}`
    );
  }

  const client = await getClient();
  const docs = await client.fetch(
    `*[_type in $types] | order(_type asc, _id asc) {
      ...,
      "slug": slug.current
    }`,
    { types }
  );

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    projectId: sanityProjectId,
    dataset: sanityDataset,
    locales: ["en", ...LOCALES.map((l) => l.code)],
    note:
      "Fill empty locale strings (es, de, nl, fr, ja, pt). Keep en as the source. For kind=blocks, use blank lines between paragraphs. Re-import with pnpm i18n:import.",
    documents: (docs || []).map(exportDocument),
  };

  const outPath = path.resolve(process.cwd(), args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");

  console.log(
    `Exported ${payload.documents.length} documents → ${outPath}`
  );
  const byType = {};
  for (const doc of payload.documents) {
    byType[doc._type] = (byType[doc._type] || 0) + 1;
  }
  console.log(byType);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
