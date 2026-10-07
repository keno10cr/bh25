/**
 * Fills the homepage "Why Blessed House" story fields in every language and
 * creates the blog post about the name and the rainforest as an unpublished
 * draft. The draft is only created once so Studio edits are never overwritten.
 *
 * Run: node --env-file=.env.local scripts/seed-rainforest-story.js
 */
import { createClient } from "@sanity/client";
import { translations } from "../src/lib/translations.js";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";

const SUFFIX = { en: "", es: "Es", de: "De", nl: "Nl", fr: "Fr", ja: "Ja", pt: "Pt", ar: "Ar" };

const BLOG_ID = "drafts.blog-why-blessed-house";

const BLOG_SECTIONS = [
  {
    heading: "From desert to rainforest",
    paragraphs: [
      "Picture a landscape where every drop of water counts: cracked earth, dry riverbeds, and long months without rain. Now picture the opposite. Rivers that run all year, leaves that drip after every shower, and a forest so green it almost glows.",
      "[Editor note: add the personal story here. Where did the family come from, and what was the moment you first stood on this land and knew it was home?]",
    ],
  },
  {
    heading: "One of the greenest places on earth",
    paragraphs: [
      "Blessed House sits on the Southern Caribbean coast of Costa Rica, at the foot of the Talamanca mountains. Moist air from the Caribbean Sea meets the mountains and falls as rain through most of the year, feeding one of the most water rich tropical rainforests on the planet.",
      "Costa Rica is home to around five percent of the world's known species, and this corner of the country shows it. Cahuita National Park, the Gandoca Manzanillo Wildlife Refuge, and the great forests of Talamanca are all close by.",
    ],
  },
  {
    heading: "Why water feels like a blessing",
    paragraphs: [
      "Water is what makes everything here possible. It keeps the rivers flowing to the sea, the gardens blooming, and the forest full of life: sloths moving slowly through the canopy, howler monkeys calling at sunrise, toucans and hummingbirds crossing the garden, and tiny red and green frogs hiding in the leaves after the rain.",
      "When you have known dry land, waking up surrounded by all of this is not something you take for granted. It is a daily reminder that we are truly blessed. That is where our name comes from.",
    ],
  },
  {
    heading: "Living inside the forest at Blessed House",
    paragraphs: [
      "Every villa at Blessed House is named after a creature of the rainforest: Colibrí, Jaguar, Rana Roja, Rana Verde, Oso Perezoso, Mono Cariblanco, Mono Ardilla, Lapa Roja, Mariposa Morpho, and Baula. Each one carries a little piece of the forest it is named after.",
      "The estate sits just five minutes from Puerto Viejo, surrounded by gardens and jungle, with a shared pool where you can float and listen to the birds. It is close enough to the beaches and town to explore, and deep enough in the green to feel far away.",
    ],
  },
  {
    heading: "How to feel it for yourself",
    paragraphs: [
      "Wake up early and listen. The forest is loudest at first light. Walk the garden right after a rain shower, when the frogs come out and everything smells fresh. Spend a morning in Cahuita National Park, swim at Playa Cocles or Punta Uva, and end the day back at the pool as the sky turns orange over the canopy.",
      "However you spend your days, we hope you leave feeling what we feel every morning here: blessed.",
    ],
  },
];

function span(text, key) {
  return { _type: "span", _key: key, text, marks: [] };
}

function blogContent() {
  const blocks = [];
  BLOG_SECTIONS.forEach((section, sectionIndex) => {
    blocks.push({
      _type: "block",
      _key: `story-h${sectionIndex}`,
      style: "h2",
      markDefs: [],
      children: [span(section.heading, `story-h${sectionIndex}-s`)],
    });
    section.paragraphs.forEach((paragraph, index) => {
      const key = `story-p${sectionIndex}-${index}`;
      blocks.push({
        _type: "block",
        _key: key,
        style: "normal",
        markDefs: [],
        children: [span(paragraph, `${key}-s`)],
      });
    });
  });
  return blocks;
}

async function run() {
  const client = createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
    token: process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });

  const homeSet = {};
  for (const [lang, suffix] of Object.entries(SUFFIX)) {
    const story = translations[lang]?.story;
    if (!story) continue;
    homeSet[`storyEyebrow${suffix}`] = story.eyebrow;
    homeSet[`storyTitle${suffix}`] = story.title;
    homeSet[`storyBody${suffix}`] = story.body;
  }
  await client.patch("homePageSettings").set(homeSet).commit();
  console.log("Homepage story fields set:", Object.keys(homeSet).length);

  await client.createIfNotExists({
    _id: BLOG_ID,
    _type: "blog",
    title: "Why We Called It Blessed House: Life Inside a Caribbean Rainforest",
    slug: { _type: "slug", current: "why-blessed-house-rainforest-story" },
    category: "Blessed House",
    excerpt:
      "The story behind our name, and why waking up in one of the greenest, most water rich rainforests on earth feels like a blessing every single day.",
    socialTitle: "Why we called it Blessed House",
    socialHook:
      "From dry desert land to a rainforest where rivers run all year. This is the story behind our name.",
    content: blogContent(),
  });
  console.log(`Blog draft ready: ${BLOG_ID}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
