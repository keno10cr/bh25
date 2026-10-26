import { decode as decodePng } from "fast-png";
import jpeg from "jpeg-js";

/** Bluesky rejects blobs over 1,000,000 bytes; keep a margin under it. */
export const SOCIAL_JPEG_MAX_BYTES = 950 * 1000;
const QUALITY_STEPS = [86, 80, 74, 68, 60, 52];

function toRgba({ width, height, data, channels, depth, palette }) {
  const pixels = width * height;
  const rgba = new Uint8Array(pixels * 4);
  const shift = depth === 16 ? 8 : 0;

  if (palette) {
    for (let i = 0; i < pixels; i += 1) {
      const entry = palette[data[i]] || [0, 0, 0];
      rgba[i * 4] = entry[0];
      rgba[i * 4 + 1] = entry[1];
      rgba[i * 4 + 2] = entry[2];
      rgba[i * 4 + 3] = 255;
    }
    return rgba;
  }

  for (let i = 0; i < pixels; i += 1) {
    const src = i * channels;
    const gray = channels < 3;
    const r = data[src] >> shift;
    rgba[i * 4] = r;
    rgba[i * 4 + 1] = gray ? r : data[src + 1] >> shift;
    rgba[i * 4 + 2] = gray ? r : data[src + 2] >> shift;
    rgba[i * 4 + 3] = 255;
  }
  return rgba;
}

/**
 * Re-encodes a rendered PNG as a baseline JPEG, lowering quality until the
 * file fits `maxBytes`. Pure JS so it runs on Vercel without native modules.
 * @returns {{ bytes: Uint8Array, quality: number }}
 */
export function pngToJpeg(pngBytes, { maxBytes = SOCIAL_JPEG_MAX_BYTES } = {}) {
  const image = decodePng(pngBytes);
  const frame = {
    width: image.width,
    height: image.height,
    data: toRgba(image),
  };

  let encoded = null;
  for (const quality of QUALITY_STEPS) {
    encoded = { bytes: jpeg.encode(frame, quality).data, quality };
    if (encoded.bytes.length <= maxBytes) break;
  }
  return { bytes: new Uint8Array(encoded.bytes), quality: encoded.quality };
}
