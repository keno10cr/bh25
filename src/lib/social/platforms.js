export const SOCIAL_PHOTO_SLOT = 950;

/** Shared photo crop used by feed 4:5 and TikTok so all three previews show the same area. */
export const SOCIAL_SHARED_PHOTO = {
  width: 1080,
  height: 1084,
};

export const SOCIAL_PLATFORMS = {
  instagram: {
    key: "instagram",
    label: "Instagram",
    order: 1,
    width: 1080,
    height: 1350,
    tallType: false,
  },
  facebook: {
    key: "facebook",
    label: "Facebook / Meta",
    order: 2,
    width: 1080,
    height: 1350,
    tallType: false,
  },
  tiktok: {
    key: "tiktok",
    label: "TikTok",
    order: 3,
    width: 1080,
    height: 1920,
    tallType: true,
  },
  x: {
    key: "x",
    label: "X",
    order: 4,
    width: 1080,
    height: 1350,
    tallType: false,
  },
  bluesky: {
    key: "bluesky",
    label: "Bluesky",
    order: 5,
    width: 1080,
    height: 1350,
    tallType: false,
  },
  pinterest: {
    key: "pinterest",
    label: "Pinterest",
    order: 6,
    width: 1000,
    height: 1500,
    tallType: true,
  },
};

export const SOCIAL_PLATFORM_KEYS = Object.keys(SOCIAL_PLATFORMS);

export function getSocialPlatform(key) {
  return SOCIAL_PLATFORMS[key] || null;
}
