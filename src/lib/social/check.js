import { buildSocialPack, SOCIAL_PACK_PATH } from "@/lib/social/pack";

const FETCH_TIMEOUT_MS = 25000;
const MB = 1024 * 1024;

/**
 * Upload limits each platform enforces on the image URL Make.com hands over.
 * `image` is the key in the webhook `images` object.
 */
export const SOCIAL_CHECK_RULES = [
  {
    id: "instagram",
    label: "Instagram",
    image: "feed",
    formats: ["jpeg"],
    maxBytes: 8 * MB,
    ratio: { min: 0.8, max: 1.91 },
    note: "Instagram only accepts JPEG files through the API.",
  },
  {
    id: "facebook",
    label: "Facebook Page",
    image: "feed",
    formats: ["jpeg", "png"],
    maxBytes: 10 * MB,
  },
  {
    id: "pinterest",
    label: "Pinterest",
    image: "pinterest",
    formats: ["jpeg", "png"],
    maxBytes: 20 * MB,
  },
  {
    id: "bluesky",
    label: "Bluesky",
    image: "feed",
    formats: ["jpeg", "png", "webp"],
    maxBytes: 1000000,
    note: "Bluesky rejects images over 1 MB, and the post must reuse the mime type returned by Upload media.",
  },
  {
    id: "googleBusiness",
    label: "Google Business Profile",
    image: "feed",
    formats: ["jpeg", "png"],
    minBytes: 10 * 1024,
    maxBytes: 5 * MB,
    minSide: 250,
  },
  {
    id: "tiktok",
    label: "TikTok",
    image: "tiktok",
    formats: ["jpeg", "webp"],
    maxBytes: 20 * MB,
    note: "TikTok photo posts accept JPEG or WEBP only.",
  },
  {
    id: "x",
    label: "X",
    image: "feed",
    formats: ["jpeg", "png", "webp"],
    maxBytes: 5 * MB,
  },
];

function detectFormat(bytes) {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP"
  ) {
    return "webp";
  }
  return "unknown";
}

function pngSize(bytes) {
  if (bytes.length < 24) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

function jpegSize(bytes) {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const isFrame =
      marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isFrame) {
      return {
        height: (bytes[offset + 5] << 8) | bytes[offset + 6],
        width: (bytes[offset + 7] << 8) | bytes[offset + 8],
      };
    }
    offset += 2 + length;
  }
  return null;
}

function imageSize(format, bytes) {
  if (format === "png") return pngSize(bytes);
  if (format === "jpeg") return jpegSize(bytes);
  return null;
}

async function timedFetch(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const started = Date.now();
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });
    return { response, ms: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}

/** Downloads one URL the way a platform would and reports what it actually serves. */
export async function inspectImage(url) {
  try {
    const { response, ms } = await timedFetch(url);
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok) {
      return { url, ok: false, status: response.status, contentType, ms, error: `HTTP ${response.status}` };
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    const format = detectFormat(bytes);
    const size = imageSize(format, bytes);
    return {
      url,
      ok: true,
      status: response.status,
      contentType,
      ms,
      bytes: bytes.length,
      format,
      width: size?.width || null,
      height: size?.height || null,
    };
  } catch (error) {
    return {
      url,
      ok: false,
      status: 0,
      error: error?.name === "AbortError" ? "Timed out" : error?.message || "Fetch failed",
    };
  }
}

async function inspectPage(url) {
  try {
    const { response, ms } = await timedFetch(url, { method: "GET" });
    return { url, ok: response.ok, status: response.status, ms };
  } catch (error) {
    return { url, ok: false, status: 0, error: error?.message || "Fetch failed" };
  }
}

function formatMb(bytes) {
  return `${(bytes / MB).toFixed(2)} MB`;
}

function evaluateRule(rule, image) {
  const issues = [];
  const warnings = [];
  if (!image?.ok) {
    issues.push(`Image did not load (${image?.error || "unknown error"}).`);
    return { status: "fail", issues, warnings };
  }
  if (!rule.formats.includes(image.format)) {
    issues.push(
      `File is ${image.format.toUpperCase()}, needs ${rule.formats
        .map((format) => format.toUpperCase())
        .join(" or ")}.`
    );
  }
  const headerFormat = image.contentType.split(";")[0].trim().replace("image/", "");
  if (image.format !== "unknown" && headerFormat && headerFormat !== image.format && !(headerFormat === "jpg" && image.format === "jpeg")) {
    warnings.push(`Server says ${image.contentType} but the file is ${image.format.toUpperCase()}.`);
  }
  if (rule.maxBytes && image.bytes > rule.maxBytes) {
    issues.push(`File is ${formatMb(image.bytes)}, limit is ${formatMb(rule.maxBytes)}.`);
  }
  if (rule.minBytes && image.bytes < rule.minBytes) {
    issues.push(`File is smaller than ${Math.round(rule.minBytes / 1024)} KB.`);
  }
  if (rule.minSide && image.width && Math.min(image.width, image.height) < rule.minSide) {
    issues.push(`Image is smaller than ${rule.minSide} px on one side.`);
  }
  if (rule.ratio && image.width && image.height) {
    const ratio = image.width / image.height;
    if (ratio < rule.ratio.min - 0.01 || ratio > rule.ratio.max + 0.01) {
      issues.push(`Aspect ratio ${ratio.toFixed(2)} is outside ${rule.ratio.min} to ${rule.ratio.max}.`);
    }
  }
  if (image.ms > 15000) {
    warnings.push(`Image took ${(image.ms / 1000).toFixed(1)} s to render; some platforms give up after about 15 s.`);
  }
  return {
    status: issues.length ? "fail" : warnings.length ? "warn" : "pass",
    issues,
    warnings,
  };
}

/** Same shape the Sanity webhook sends to Make.com, built from the live pack. */
export function webhookPayloadFor(pack, origin) {
  return {
    source: pack.source || "blog",
    title: pack.title,
    socialTitle: pack.socialTitle,
    socialHook: pack.socialHook,
    slug: pack.slug,
    mainImageUrl: pack.mainImageUrl,
    description: pack.socialHook || pack.title,
    url: pack.url,
    category: pack.category,
    packUrl: `${origin}${SOCIAL_PACK_PATH}?slug=${pack.slug}`,
    images: {
      feed: pack.images.feed.url,
      tiktok: pack.images.tiktok.url,
      pinterest: pack.images.pinterest.url,
    },
  };
}

export async function runSocialCheck({ post, origin }) {
  const pack = buildSocialPack({ post, origin });
  if (!pack) return null;

  const [feed, tiktok, pinterest, blogPage, mainImage] = await Promise.all([
    inspectImage(pack.images.feed.url),
    inspectImage(pack.images.tiktok.url),
    inspectImage(pack.images.pinterest.url),
    inspectPage(pack.url),
    pack.mainImageUrl ? inspectImage(pack.mainImageUrl) : Promise.resolve(null),
  ]);
  const images = { feed, tiktok, pinterest };

  const platforms = SOCIAL_CHECK_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    image: rule.image,
    note: rule.note || "",
    ...evaluateRule(rule, images[rule.image]),
  }));

  return {
    checkedAt: new Date().toISOString(),
    origin,
    pack,
    payload: webhookPayloadFor(pack, origin),
    images,
    blogPage,
    mainImage,
    platforms,
  };
}
