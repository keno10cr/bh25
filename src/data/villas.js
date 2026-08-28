const BH = { lat: 9.64735, lng: -82.77697 };

export function getGalleryImages(villaNumber) {
  const folder = `/villas/${villaNumber}/`;
  const maxImages = {
    3: 5,
    4: 6,
    5: 5,
    6: 4,
    7: 7,
    8: 7,
    9: 5,
    10: 7,
    11: 8,
    12: 8,
  };
  const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const images = [];
  const count = maxImages[villaNumber] || 8;

  for (let i = 0; i < count; i++) {
    images.push(folder + `${villaNumber}${letters[i]}.jpg`);
  }

  images.push(
    "/villas/general/charger.jpg",
    "/villas/general/junglepool.jpg",
    "/villas/general/map.jpg",
    "/villas/general/pool.jpg"
  );

  return images;
}

export const AIRBNB_HOST_URL = "https://www.airbnb.com/users/show/549621434";

export const STATIC_VILLAS = [
  {
    id: 3,
    name: "Villa #3 Baula Turtle",
    slug: "villa-3-baula-turtle",
    translationKey: "villa3",
    bedrooms: 4,
    bathrooms: 2,
    maxPeople: 10,
    amenities: ["wifi", "kitchen", "parking", "hotWater", "sharedPool"],
    bedInfo: "bedInfo3house",
    image: "/villas/3/3a.jpg",
    galleryImages: getGalleryImages(3),
    bookingUrl: AIRBNB_HOST_URL,
  },
  {
    id: 4,
    name: "Villa #4 Colibrí",
    slug: "villa-4-colibri",
    translationKey: "villa4",
    bedrooms: 1,
    bathrooms: 1,
    maxPeople: 3,
    amenities: ["wifi", "kitchen", "parking", "hotWater", "sharedPool"],
    bedInfo: "bedInfo1",
    image: "/villas/4/4a.jpg",
    galleryImages: getGalleryImages(4),
    bookingUrl: AIRBNB_HOST_URL,
  },
  {
    id: 5,
    name: "Villa #5 Jaguar",
    slug: "villa-5-jaguar",
    translationKey: "villa5",
    bedrooms: 3,
    bathrooms: 1.5,
    maxPeople: 7,
    amenities: ["ac", "wifi", "kitchen", "parking", "hotWater", "sharedPool"],
    bedInfo: "bedInfo5house",
    image: "/villas/5/5c.jpg",
    galleryImages: getGalleryImages(5),
    bookingUrl: AIRBNB_HOST_URL,
  },
  {
    id: 6,
    name: "Villa #6 Rana Roja",
    slug: "villa-6-rana-roja",
    translationKey: "villa6",
    bedrooms: 1,
    bathrooms: 1,
    maxPeople: 2,
    amenities: ["wifi", "kitchen", "parking", "hotWater", "sharedPool"],
    bedInfo: "bedInfo2",
    image: "/villas/6/6f.jpg",
    galleryImages: getGalleryImages(6),
    bookingUrl: AIRBNB_HOST_URL,
  },
  {
    id: 7,
    name: "Villa #7 Rana Verde",
    slug: "villa-7-rana-verde",
    translationKey: "villa7",
    bedrooms: 2,
    bathrooms: 2,
    maxPeople: 6,
    amenities: ["ac", "wifi", "bbqArea", "kitchen", "parking", "hotWater", "sharedPool"],
    bedInfo: "bedInfo7",
    image: "/villas/7/7d.jpg",
    galleryImages: getGalleryImages(7),
    bookingUrl: AIRBNB_HOST_URL,
  },
  {
    id: 8,
    name: "Villa #8 Oso peresozo",
    slug: "villa-8-oso-peresozo",
    translationKey: "villa8",
    bedrooms: 1,
    bathrooms: 1,
    maxPeople: 5,
    amenities: ["ac", "wifi", "bbqArea", "kitchen", "parking", "hotWater", "sharedPool"],
    bedInfo: "bedInfo3",
    image: "/villas/8/8a.jpg",
    galleryImages: getGalleryImages(8),
    bookingUrl: AIRBNB_HOST_URL,
  },
  {
    id: 9,
    name: "Villa #9 Mono Cariblanco",
    slug: "villa-9-mono-cariblanco",
    translationKey: "villa9",
    bedrooms: 1,
    bathrooms: 1,
    maxPeople: 3,
    amenities: ["wifi", "kitchen", "parking", "hotWater", "sharedPool"],
    bedInfo: "bedInfo4",
    image: "/villas/9/9a.jpg",
    galleryImages: getGalleryImages(9),
    bookingUrl: AIRBNB_HOST_URL,
  },
  {
    id: 10,
    name: "Villa #10 Mono Ardilla",
    slug: "villa-10-mono-ardilla",
    translationKey: "villa10",
    bedrooms: 1,
    bathrooms: 1,
    maxPeople: 4,
    amenities: ["wifi", "bbqArea", "kitchen", "parking", "hotWater", "sharedPool"],
    bedInfo: "bedInfo5",
    image: "/villas/10/10d.jpg",
    galleryImages: getGalleryImages(10),
    bookingUrl: AIRBNB_HOST_URL,
  },
  {
    id: 11,
    name: "Villa #11 Lapa Roja",
    slug: "villa-11-lapa-roja",
    translationKey: "villa11",
    bedrooms: 2,
    bathrooms: 1,
    maxPeople: 6,
    amenities: ["ac", "wifi", "bbqArea", "kitchen", "parking", "hotWater", "sharedPool"],
    bedInfo: "bedInfo6",
    image: "/villas/11/11g.jpg",
    galleryImages: getGalleryImages(11),
    bookingUrl: AIRBNB_HOST_URL,
  },
  {
    id: 12,
    name: "Villa #12 Mariposa Morpho",
    slug: "villa-12-mariposa-morpho",
    translationKey: "villa12",
    bedrooms: 2,
    bathrooms: 2,
    maxPeople: 8,
    amenities: ["ac", "wifi", "bbqArea", "kitchen", "parking", "hotWater", "sharedPool"],
    bedInfo: "bedInfo12",
    image: "/villas/12/12i.jpg",
    galleryImages: getGalleryImages(12),
    bookingUrl: AIRBNB_HOST_URL,
  },
];
