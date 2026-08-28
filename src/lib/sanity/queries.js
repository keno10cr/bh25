export const activitiesQuery = `*[_type == "activity"] | order(title asc) {
  _id,
  title,
  titleEs,
  titleDe,
  titleNl,
  titleFr,
  titleJa,
  titlePt,
  "slug": slug.current,
  category,
  difficulty,
  duration,
  durationEs,
  durationDe,
  durationNl,
  durationFr,
  durationJa,
  durationPt,
  groupSize,
  groupSizeEs,
  groupSizeDe,
  groupSizeNl,
  groupSizeFr,
  groupSizeJa,
  groupSizePt,
  coordinates,
  "image": image.asset->url,
  description,
  whatsIncluded,
  whatsIncludedEs,
  whatsIncludedDe,
  whatsIncludedNl,
  whatsIncludedFr,
  whatsIncludedJa,
  whatsIncludedPt,
  gallery[]{
    "url": asset->url,
    alt
  },
  legendItems[]->{
    _id,
    title,
    "slug": slug.current,
    color
  }
}`;

export const activityBySlugQuery = `*[_type == "activity" && slug.current == $slug][0] {
  _id,
  title,
  titleEs,
  titleDe,
  titleNl,
  titleFr,
  titleJa,
  titlePt,
  "slug": slug.current,
  category,
  difficulty,
  duration,
  durationEs,
  durationDe,
  durationNl,
  durationFr,
  durationJa,
  durationPt,
  groupSize,
  groupSizeEs,
  groupSizeDe,
  groupSizeNl,
  groupSizeFr,
  groupSizeJa,
  groupSizePt,
  coordinates,
  "image": image.asset->url,
  description,
  descriptionEs,
  descriptionDe,
  descriptionNl,
  descriptionFr,
  descriptionJa,
  descriptionPt,
  whatsIncluded,
  whatsIncludedEs,
  whatsIncludedDe,
  whatsIncludedNl,
  whatsIncludedFr,
  whatsIncludedJa,
  whatsIncludedPt,
  gallery[]{
    "url": asset->url,
    alt
  },
  legendItems[]->{
    _id,
    title,
    "slug": slug.current,
    color
  }
}`;

export const activitySlugsQuery = `*[_type == "activity" && defined(slug.current)].slug.current`;

export const legendItemsQuery = `*[_type == "legendItem"] | order(sortOrder asc, title asc) {
  _id,
  title,
  "slug": slug.current,
  color
}`;

export const villasQuery = `*[_type == "villa"] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  capacity,
  bedrooms,
  bathrooms,
  amenities,
  "gallery": gallery[].asset->url,
  description,
  bookingUrl
}`;

export const villaBySlugQuery = `*[_type == "villa" && slug.current == $slug][0] {
  _id,
  name,
  "slug": slug.current,
  capacity,
  bedrooms,
  bathrooms,
  amenities,
  "gallery": gallery[].asset->url,
  description,
  bookingUrl
}`;

export const villaSlugsQuery = `*[_type == "villa" && defined(slug.current)].slug.current`;

export const reviewsQuery = `*[_type == "review"] | order(date desc) {
  _id,
  guestName,
  date,
  rating,
  comment,
  "villaName": villaRef->name,
  "villaSlug": villaRef->slug.current
}`;

export const publishedVillaCommentsQuery = `*[_type == "formSubmission" && formType == "villaComment" && status == "published" && villaRef->slug.current == $slug] | order(submittedAt desc) {
  _id,
  name,
  rating,
  message,
  submittedAt,
  "villaSlug": villaRef->slug.current
}`;

export const publishedGuestExperiencesQuery = `*[_type == "formSubmission" && formType == "guestExperience" && status == "published"] | order(submittedAt desc) {
  _id,
  name,
  rating,
  message,
  submittedAt
}`;

export const blogPostsQuery = `*[_type == "blog"] | order(publishedAt desc) {
  _id,
  title,
  titleEs,
  titleDe,
  titleNl,
  titleFr,
  titleJa,
  titlePt,
  "slug": slug.current,
  category,
  publishedAt,
  excerpt,
  excerptEs,
  excerptDe,
  excerptNl,
  excerptFr,
  excerptJa,
  excerptPt,
  "featuredImage": featuredImage.asset->url
}`;

export const blogPostBySlugQuery = `*[_type == "blog" && slug.current == $slug][0] {
  _id,
  title,
  titleEs,
  titleDe,
  titleNl,
  titleFr,
  titleJa,
  titlePt,
  "slug": slug.current,
  category,
  publishedAt,
  excerpt,
  excerptEs,
  excerptDe,
  excerptNl,
  excerptFr,
  excerptJa,
  excerptPt,
  "featuredImage": featuredImage.asset->url,
  content,
  contentEs,
  contentDe,
  contentNl,
  contentFr,
  contentJa,
  contentPt
}`;

export const blogSlugsQuery = `*[_type == "blog" && defined(slug.current)].slug.current`;

export const homePageSettingsQuery = `*[_id == "homePageSettings"][0]{
  ...,
  thingsToDoItems[]{
    _key,
    title,
    description,
    "image": image.asset->url
  },
  featuredItems[]{
    _key,
    slug,
    name,
    teaser,
    "image": image.asset->url
  }
}`;
export const aboutPageSettingsQuery = `*[_id == "aboutPageSettings"][0]`;
export const contactPageSettingsQuery = `*[_id == "contactPageSettings"][0]`;
export const activitiesPageSettingsQuery = `*[_id == "activitiesPageSettings"][0]`;
export const blogPageSettingsQuery = `*[_id == "blogPageSettings"][0]`;
export const villasPageSettingsQuery = `*[_id == "villasPageSettings"][0]`;

export const propertyBySlugQuery = `*[_type == "property" && slug.current == $slug && listed != false && !(_id in path("drafts.**"))][0]{
  _id,
  name,
  listed,
  "slug": slug.current,
  priceMin,
  priceMax,
  currency,
  minimumNights,
  baseGuestCount,
  extraGuestFeePerNight,
  bathrooms,
  petsMax,
  amenities,
  shortDescription,
  "heroImage": heroImage.asset->url,
  "gallery": gallery[].asset->url,
  seasonalPricing[]{
    titleEn,
    startDate,
    endDate,
    price
  },
  houseArrangements[]{
    quantity,
    customTitleEn,
    customTitleEs,
    roomType->{
      titleEn,
      titleEs,
      configEn,
      configEs,
      capacity,
      icon
    }
  },
  "propertyKindTitle": propertyKind->titleEn,
  "locationLabel": locationRef->label_en,
  regionEn,
  houseRulesAreaRules[]{
    titleEn,
    bodyEn
  },
  houseRulesReview{
    smokingEn,
    dogsEn,
    partiesEn,
    quietHoursEn
  }
}`;

export const propertySlugsQuery = `*[_type == "property" && listed != false && defined(slug.current) && !(_id in path("drafts.**"))].slug.current`;
