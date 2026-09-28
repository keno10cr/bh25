/**
 * Browser side resize for Family Blog photos: center crop to a fixed shape,
 * scale to the exact target size, and encode as JPG before upload.
 */

export const FAMILY_PHOTO_SHAPES = [
  { id: "landscape", label: "Landscape 1600 × 1200", width: 1600, height: 1200 },
  { id: "square", label: "Square 1600 × 1600", width: 1600, height: 1600 },
  { id: "portrait", label: "Portrait 1200 × 1600", width: 1200, height: 1600 },
];

export const DEFAULT_FAMILY_PHOTO_SHAPE = "landscape";

const JPEG_QUALITY = 0.85;
const MIN_CROP_SIDE = 950;

export function familyPhotoShape(id) {
  return (
    FAMILY_PHOTO_SHAPES.find((shape) => shape.id === id) ||
    FAMILY_PHOTO_SHAPES[0]
  );
}

/** Asset ids look like image-<hash>-1600x1200-jpg. */
export function isResizedFamilyPhotoRef(ref) {
  const match = /-(\d+)x(\d+)-(\w+)$/.exec(ref || "");
  if (!match) return false;
  const [, width, height, format] = match;
  if (format !== "jpg") return false;
  return FAMILY_PHOTO_SHAPES.some(
    (shape) => shape.width === Number(width) && shape.height === Number(height)
  );
}

async function decodeImage(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Fall back to <img>, which also respects EXIF rotation.
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          "This photo format could not be read. Please try a JPG or PNG photo."
        )
      );
    };
    img.src = url;
  });
}

function baseName(filename) {
  const stem = String(filename || "photo").replace(/\.[^.]+$/, "");
  const clean = stem
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return clean || "photo";
}

export async function resizeFamilyPhoto(file, shapeId) {
  const shape = familyPhotoShape(shapeId);
  const source = await decodeImage(file);
  const sourceWidth = source.width;
  const sourceHeight = source.height;
  const targetRatio = shape.width / shape.height;

  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;
  if (sourceWidth / sourceHeight > targetRatio) {
    cropWidth = Math.round(sourceHeight * targetRatio);
  } else {
    cropHeight = Math.round(sourceWidth / targetRatio);
  }

  if (Math.min(cropWidth, cropHeight) < MIN_CROP_SIDE) {
    throw new Error(
      `This photo is too small (${sourceWidth} × ${sourceHeight}). Please use the original photo from the phone.`
    );
  }

  const canvas = document.createElement("canvas");
  canvas.width = shape.width;
  canvas.height = shape.height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, shape.width, shape.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    source,
    Math.round((sourceWidth - cropWidth) / 2),
    Math.round((sourceHeight - cropHeight) / 2),
    cropWidth,
    cropHeight,
    0,
    0,
    shape.width,
    shape.height
  );
  if (typeof source.close === "function") source.close();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error("Could not save the photo.")),
      "image/jpeg",
      JPEG_QUALITY
    );
  });

  return {
    blob,
    filename: `${baseName(file.name)}-${shape.width}x${shape.height}.jpg`,
    shape,
  };
}
