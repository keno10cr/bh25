import { STATIC_ACTIVITIES } from "@/data/activities";

/** Lightweight villa list for contact form selection */
export const CONTACT_VILLAS = [
  { id: 3, name: "Villa #3 Tortuga Baula", nameEn: "Villa #3 Leatherback Turtle", maxPeople: 10, slug: "villa-3-baula-turtle" },
  { id: 4, name: "Villa #4 Colibrí", nameEn: "Villa #4 Hummingbird", maxPeople: 4, slug: "villa-4-colibri" },
  { id: 5, name: "Villa #5 Jaguar", nameEn: "Villa #5 Jaguar", maxPeople: 7, slug: "villa-5-jaguar" },
  { id: 6, name: "Villa #6 Rana Roja", nameEn: "Villa #6 Red Frog", maxPeople: 2, slug: "villa-6-rana-roja" },
  { id: 7, name: "Villa #7 Rana Verde", nameEn: "Villa #7 Green Frog", maxPeople: 6, slug: "villa-7-rana-verde" },
  { id: 8, name: "Villa #8 Oso Perezoso", nameEn: "Villa #8 Sloth", maxPeople: 5, slug: "villa-8-oso-peresozo" },
  { id: 9, name: "Villa #9 Mono Cariblanco", nameEn: "Villa #9 Capuchin Monkey", maxPeople: 3, slug: "villa-9-mono-cariblanco" },
  { id: 10, name: "Villa #10 Mono Ardilla", nameEn: "Villa #10 Squirrel Monkey", maxPeople: 4, slug: "villa-10-mono-ardilla" },
  { id: 11, name: "Villa #11 Lapa Roja", nameEn: "Villa #11 Scarlet Macaw", maxPeople: 6, slug: "villa-11-lapa-roja" },
  { id: 12, name: "Villa #12 Mariposa Morpho", nameEn: "Villa #12 Blue Morpho Butterfly", maxPeople: 8, slug: "villa-12-mariposa-morpho" },
];

/** Activity options for contact form selection (synced with static activities) */
export const CONTACT_ACTIVITIES = STATIC_ACTIVITIES.filter(
  (activity) => !activity.groupOnly
).map((activity) => ({
  id: activity.id,
  slug: activity.slug,
  translationKey: activity.translationKey,
}));

export const SUBJECT_OPTIONS = [
  {
    value: "booking",
    icon: "/icons/villas.svg",
    labelKey: "booking",
  },
  {
    value: "activities",
    icon: "/icons/activity.svg",
    labelKey: "activityInquiry",
  },
  {
    value: "general",
    icon: "/icons/general.svg",
    labelKey: "generalInquiry",
  },
];
