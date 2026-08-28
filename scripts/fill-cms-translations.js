/**
 * Fill Sanity locale fields (titleNl, descriptionEs, …) from translations.js.
 * English remains the source of truth in Studio. Non English UI already prefers
 * translations.js when the visitor language is not English.
 *
 * Usage: pnpm translate:cms
 */
import { createClient } from "@sanity/client";
import { STATIC_ACTIVITIES } from "../src/data/activities.js";
import { STATIC_VILLAS } from "../src/data/villas.js";
import { translations } from "../src/lib/translations.js";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";
import { LEGEND_ITEMS } from "./legend-items.js";

const LOCALES = [
  { lang: "es", suffix: "Es" },
  { lang: "de", suffix: "De" },
  { lang: "nl", suffix: "Nl" },
  { lang: "fr", suffix: "Fr" },
  { lang: "ja", suffix: "Ja" },
  { lang: "pt", suffix: "Pt" },
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

function pick(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

async function seed() {
  const client = await getClient();
  const transaction = client.transaction();
  let patches = 0;

  for (const activity of STATIC_ACTIVITIES) {
    const patch = {};
    for (const { lang, suffix } of LOCALES) {
      const copy = pick(translations[lang], `activitiesPage.${activity.translationKey}`);
      if (!copy) continue;
      if (copy.name) patch[`title${suffix}`] = copy.name;
      if (copy.fullDescription || copy.description) {
        patch[`description${suffix}`] = toBlocks(
          copy.fullDescription || copy.description,
          `${activity.slug}-${lang}`
        );
      }
      const duration = pick(
        translations[lang],
        `activitiesPage.durations.${activity.duration}`
      );
      if (duration && duration !== activity.duration) {
        patch[`duration${suffix}`] = duration;
      }
      const groupSize = pick(
        translations[lang],
        `activitiesPage.groupSizes.${activity.groupSize}`
      );
      if (groupSize && groupSize !== activity.groupSize) {
        patch[`groupSize${suffix}`] = groupSize;
      }
      if (Array.isArray(copy.highlights) && copy.highlights.length > 0) {
        patch[`whatsIncluded${suffix}`] = copy.highlights.filter(Boolean);
      }
    }
    if (Object.keys(patch).length) {
      transaction.patch(`activity-${activity.slug}`, { set: patch });
      patches += 1;
      console.log(`Activity ${activity.slug}`);
    }
  }

  for (const villa of STATIC_VILLAS) {
    const patch = {};
    for (const { lang, suffix } of LOCALES) {
      const copy = pick(translations[lang], `villas.${villa.translationKey}`);
      if (!copy) continue;
      if (villa.name) patch[`name${suffix}`] = villa.name;
      if (copy.description) {
        patch[`description${suffix}`] = toBlocks(
          copy.description,
          `${villa.slug}-${lang}`
        );
      }
    }
    if (Object.keys(patch).length) {
      transaction.patch(`villa-${villa.slug}`, { set: patch });
      patches += 1;
      console.log(`Villa ${villa.slug}`);
    }
  }

  for (const item of LEGEND_ITEMS) {
    const patch = {};
    for (const { lang, suffix } of LOCALES) {
      const title = pick(
        translations[lang],
        `activitiesPage.legend.${item.slug}`
      );
      if (title) patch[`title${suffix}`] = title;
    }
    if (Object.keys(patch).length) {
      transaction.patch(item._id, { set: patch });
      patches += 1;
      console.log(`Legend ${item.slug}`);
    }
  }

  const pagePatches = [
    {
      id: "activitiesPageSettings",
      fields: {
        title: "activitiesPage.title",
        subtitle: "activitiesPage.subtitle",
      },
    },
    {
      id: "villasPageSettings",
      fields: {
        title: "villas.title",
        subtitle: "villas.subtitle",
      },
    },
    {
      id: "blogPageSettings",
      fields: {
        title: "blog.title",
        subtitle: "blog.subtitle",
      },
    },
    {
      id: "contactPageSettings",
      fields: {
        title: "contactPage.title",
        subtitle: "contactPage.subtitle",
        formTitle: "contactPage.formTitle",
        infoTitle: "contactPage.contactInfo.title",
      },
    },
    {
      id: "aboutPageSettings",
      fields: {
        welcomeTitle: "welcome.title",
        welcomeDescription: "welcome.description",
        welcomeVideoBy: "welcome.videoBy",
        ourPlaceTitle: "ourPlace.title",
        ourPlaceDescription: "ourPlace.description",
        ourPlaceCta: "ourPlace.contactUs",
      },
    },
    {
      id: "homePageSettings",
      fields: {
        heroTitle: "hero.title",
        heroSubtitle: "hero.subtitle",
        heroCtaPrimary: "hero.exploreVillas",
        heroCtaSecondary: "hero.getInTouch",
        featuredTitle: "featuredVillas.title",
        featuredSubtitle: "featuredVillas.subtitle",
        featuredLearnMore: "common.learnMore",
        featuredCta: "featuredVillas.viewAll",
        locationTitle: "location.title",
        locationDescription: "location.description",
        locationMapsInfo: "location.mapsInfo",
        locationCta: "location.contactUs",
        activitiesTitle: "activities.title",
        activitiesSubtitle: "activities.subtitle",
        activitiesCta: "activities.exploreAll",
        reviewsTitle: "reviews.title",
        reviewsSubtitle: "reviews.subtitle",
      },
    },
  ];

  for (const page of pagePatches) {
    const patch = {};
    for (const { lang, suffix } of LOCALES) {
      for (const [field, key] of Object.entries(page.fields)) {
        const value = pick(translations[lang], key);
        if (value) patch[`${field}${suffix}`] = value;
      }
    }
    if (Object.keys(patch).length) {
      transaction.patch(page.id, { set: patch });
      patches += 1;
      console.log(`Page ${page.id}`);
    }
  }

  console.log(`Committing ${patches} document patches...`);
  await transaction.commit({ autoGenerateArrayKeys: true });
  console.log("Filled CMS locale fields from translations.js");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
