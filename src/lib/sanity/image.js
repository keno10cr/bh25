import imageUrlBuilder from "@sanity/image-url";
import { createSanityReadClient } from "./client";

const builder = imageUrlBuilder(createSanityReadClient());

export function urlForImage(source) {
  if (!source) return null;
  return builder.image(source);
}

export function urlForHeroImage(source) {
  if (!source) return null;
  return builder.image(source).fit("crop").auto("format");
}
