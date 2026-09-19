/**
 * Create Transport/Dining legend items plus the Staria shuttle
 * (public) and group meals (group-only) activities.
 *
 * Run: npm run seed:group-services
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "next-sanity";
import { translations } from "../src/lib/translations.js";
import {
  legendDocument,
  legendRefsForCategory,
  LEGEND_ITEMS,
} from "./legend-items.js";
import { toWhatsIncludedItems } from "./whats-included.js";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";

const SERVICES = [
  {
    id: "activity-airport-shuttle",
    slug: "airport-shuttle",
    translationKey: "airportShuttle",
    category: "Transport",
    groupOnly: false,
    difficulty: "Easy",
    duration: "Airport transfer",
    groupSize: "Up to 9 passengers",
    imagePath: "activities/all/stariaShuttle.jpg",
    imageAlt:
      "Silver Hyundai Staria passenger van on the rainforest driveway at Blessed House",
    coordinates: { lat: 9.64735, lng: -82.77697 },
  },
  {
    id: "activity-group-meals",
    slug: "group-meals",
    translationKey: "groupMeals",
    category: "Dining",
    groupOnly: true,
    difficulty: "",
    duration: "Daily during stay",
    groupSize: "20 to 45 guests",
    imagePath: "activities/all/groupBreakfast.jpg",
    imageAlt:
      "Private group breakfast table under an open-air pavilion at Blessed House",
    coordinates: { lat: 9.64735, lng: -82.77697 },
  },
];

function toBlocks(text, prefix) {
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

async function uploadImage(client, relativePath, alt) {
  const filePath = path.join(process.cwd(), "public", relativePath);
  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping missing image: ${relativePath}`);
    return undefined;
  }

  const buffer = fs.readFileSync(filePath);
  const asset = await client.assets.upload("image", buffer, {
    filename: path.basename(filePath),
  });

  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt,
  };
}

function localizedCopy(service) {
  const en = translations.en.activitiesPage[service.translationKey] || {};
  const es = translations.es.activitiesPage[service.translationKey] || {};
  return {
    title: en.name || service.slug,
    titleEs: es.name || "",
    description: toBlocks(
      [en.description, en.fullDescription].filter(Boolean).join("\n\n"),
      service.slug
    ),
    descriptionEs: toBlocks(
      [es.description, es.fullDescription].filter(Boolean).join("\n\n"),
      `${service.slug}-es`
    ),
    whatsIncluded: toWhatsIncludedItems(en.highlights, service.slug),
    whatsIncludedEs: toWhatsIncludedItems(es.highlights, `${service.slug}-es`),
  };
}

async function seed() {
  const client = await getClient();
  const extraLegends = LEGEND_ITEMS.filter((item) =>
    ["transport", "dining"].includes(item.slug)
  );

  for (const item of extraLegends) {
    await client.createOrReplace(legendDocument(item));
    console.log(`Legend ready: ${item.title}`);
  }

  for (const service of SERVICES) {
    const existing = await client.fetch(
      `*[_type == "activity" && (slug.current == $slug || _id == $id)][0]{_id}`,
      { slug: service.slug, id: service.id }
    );
    const image = await uploadImage(
      client,
      service.imagePath,
      service.imageAlt
    );
    const copy = localizedCopy(service);
    const fields = {
      title: copy.title,
      titleEs: copy.titleEs,
      slug: { _type: "slug", current: service.slug },
      category: service.category,
      legendItems: legendRefsForCategory(service.category),
      groupOnly: service.groupOnly,
      duration: service.duration,
      groupSize: service.groupSize,
      coordinates: {
        _type: "geopoint",
        lat: service.coordinates.lat,
        lng: service.coordinates.lng,
      },
      description: copy.description,
      descriptionEs: copy.descriptionEs,
      whatsIncluded: copy.whatsIncluded,
      whatsIncludedEs: copy.whatsIncludedEs,
    };
    if (service.difficulty) {
      fields.difficulty = service.difficulty;
    }
    if (image) {
      fields.image = image;
    }

    if (existing?._id) {
      await client.patch(existing._id).set(fields).commit();
      console.log(`Updated ${service.slug} (${existing._id}).`);
    } else {
      await client.create({
        _id: service.id,
        _type: "activity",
        ...fields,
      });
      console.log(`Created ${service.slug} (${service.id}).`);
    }
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
