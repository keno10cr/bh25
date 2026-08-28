/** Short villa page comments (not used on the home reviews marquee). */

export const VILLA_COMMENT_GUESTS = [
  "Anna L.",
  "Ben R.",
  "Carla M.",
  "Daniel K.",
  "Emma W.",
  "Felix H.",
  "Grace T.",
  "Hugo P.",
  "Isla N.",
  "Julia S.",
  "Kai M.",
  "Laura B.",
  "Marco D.",
  "Nina F.",
  "Oscar V.",
  "Paula J.",
  "Quinn A.",
  "Rosa C.",
  "Sam E.",
  "Tara G.",
  "Uma R.",
  "Victor L.",
  "Wendy O.",
  "Ximena P.",
  "Yuki T.",
  "Zoe H.",
  "Adrian C.",
  "Bianca S.",
  "Chris M.",
  "Diana F.",
  "Ethan B.",
  "Flora K.",
  "Gabe N.",
  "Helen R.",
  "Ivan D.",
  "Jade W.",
  "Kyle P.",
  "Lily A.",
  "Miles T.",
  "Nora V.",
  "Owen S.",
  "Petra L.",
  "Quincy M.",
  "Rita G.",
  "Stefan H.",
  "Tess B.",
  "Ulrich K.",
  "Vera J.",
  "Will C.",
  "Yara N.",
];

export const VILLA_COMMENT_POOL = [
  "So peaceful. We heard birds at dawn and the jungle felt private, even with other guests nearby.",
  "Beautiful green setting. Playa Negra was a quick ride and the villa felt tucked away.",
  "Loved the quiet mornings on the porch. Nature everywhere, and the beach close enough for daily swims.",
  "Private and calm. We saw a sloth on the path and still made it to Puerto Viejo in minutes.",
  "The gardens are gorgeous. Felt far from crowds, but the coast was always close.",
  "Perfect mix of jungle privacy and beach access. Everything felt fresh and open.",
  "Such a pretty property. Short trip to the sand, then back to a quiet villa at night.",
  "We came for the beaches and stayed for the stillness. The villa felt like our own corner of the forest.",
  "Green, bright, and relaxing. Cocles was easy to reach and the nights were very quiet.",
  "Wildlife outside, peace inside. Five minutes to town and we still felt away from it all.",
  "Beautiful light through the trees. The pool and the nearby beach made every day simple.",
  "Private cabin energy with shared jungle views. Beach runs were part of our routine.",
  "So close to the Caribbean, yet it felt like a hidden retreat. We loved the natural setting.",
  "The villa was spotless and the location ideal. Punta Uva one day, quiet hammock time the next.",
  "Nature all around without feeling remote. Playa Negra sunsets, then a calm night here.",
  "Lush, green, and serene. We walked the garden every morning before heading to the beach.",
  "Exactly the privacy we wanted. Short drive to Puerto Viejo, beautiful property the rest of the day.",
  "Birdsong, soft breeze, and an easy beach day whenever we wanted. Wonderful stay.",
  "The property is stunning in the morning light. Felt private, close to the coast, and very relaxing.",
  "Quiet villa, vibrant jungle. We loved how quickly we could be at the water.",
  "Beautiful place to unwind. The beach was never far and the nights were perfectly still.",
  "Green canopy, open air, and real privacy. A lovely base for exploring the coast.",
  "We felt surrounded by nature but still comfortable. Beach trips were quick and easy.",
  "Such a pretty corner of Blessed House. Peaceful sleep and beautiful walks outside.",
  "The setting is magical. Close to great beaches, but peaceful the moment we stepped in.",
  "Private, natural, and close to everything we wanted on the coast.",
  "Morning coffee with jungle sounds, afternoon at the beach. Simple and beautiful.",
  "We loved the seclusion. Puerto Viejo was close, yet the villa felt miles away from noise.",
  "Gorgeous gardens and a calm atmosphere. Perfect after long days in the sun.",
  "The villa felt hidden in the best way. Nature close, beach close, stress far away.",
  "Beautiful property and an easy rhythm. Swim, walk, return to quiet green shade.",
  "So much green around the unit. Playa Negra was our favorite quick escape.",
  "Peaceful stay with easy beach access. We saw hummingbirds from the path every day.",
  "Private nights, bright days. The coast is near and the property is lovely.",
  "We wanted nature and privacy, and got both. The beach was always within reach.",
  "Calm, pretty, and well placed. A short hop to the sand, then back to quiet.",
  "The jungle setting is beautiful. Felt like a retreat, not a busy resort.",
  "Loved how close we were to the water. The villa itself was quiet and green.",
  "Everything felt natural and open. Great beaches nearby, peaceful home base.",
  "Beautiful surroundings and real quiet at night. Exactly what we needed.",
  "Private villa feel with shared tropical gardens. Beach days were effortless.",
  "The property is lovely. We heard howlers once and still slept like babies.",
  "Green, airy, and close to the Caribbean. A perfect balance for our trip.",
  "Nature on the doorstep, beach down the road. Beautiful and relaxing.",
  "Such a peaceful spot. Short ride to town, beautiful views around the villa.",
  "We loved the privacy here. Mornings in the garden, afternoons at the beach.",
  "Pretty, calm, and close to Playa Negra. Would happily return.",
  "The villa felt tucked into the forest. Beach time was easy and the setting was gorgeous.",
  "Quiet, lush, and convenient. A beautiful place to slow down near the coast.",
  "Wildlife, shade, and an easy beach routine. The property looks even better in person.",
];

function hashSeed(value) {
  let hash = 0;
  const str = String(value);
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Stable 3 to 7 comments per villa, unique within each villa. */
export function pickVillaComments(villa) {
  const count = 3 + (hashSeed(villa.slug) % 5);
  const poolSize = VILLA_COMMENT_POOL.length;
  const guestSize = VILLA_COMMENT_GUESTS.length;
  const start = hashSeed(`${villa.slug}-comments`) % poolSize;
  const step = 5 + (hashSeed(villa.id) % 7);

  const comments = [];
  const used = new Set();
  for (let i = 0; comments.length < count && i < poolSize * 2; i += 1) {
    const commentIndex = (start + i * step) % poolSize;
    if (used.has(commentIndex)) continue;
    used.add(commentIndex);
    const guestIndex =
      (hashSeed(`${villa.slug}-${commentIndex}`) + i) % guestSize;
    const month = 1 + ((hashSeed(`${villa.id}-${i}`) % 12) + 1);
    const day = 1 + (hashSeed(`${villa.slug}-d-${i}`) % 27);
    const year = 2024 + (hashSeed(`${villa.id}-y-${i}`) % 3);
    comments.push({
      guestName: VILLA_COMMENT_GUESTS[guestIndex],
      rating: hashSeed(`${villa.slug}-r-${i}`) % 5 === 0 ? 4 : 5,
      message: VILLA_COMMENT_POOL[commentIndex],
      submittedAt: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T16:00:00.000Z`,
    });
  }
  return comments;
}
