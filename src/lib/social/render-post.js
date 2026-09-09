import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getSocialPlatform, SOCIAL_SHARED_PHOTO } from "./platforms";

export const SOCIAL_COLORS = {
  green: "#0a4c3a",
  greenDeep: "#063528",
  gold: "#f79d1f",
  cream: "#f7f1e3",
  white: "#ffffff",
};

const SQUARE_FOOTER = { width: 959, height: 237.5 };
const RADIUS = 28;
const LOGO_H = 198;
const LOGO_W = Math.round((LOGO_H * 316) / 272);
const TIKTOK_LOGO_H = 148;
const TIKTOK_LOGO_W = Math.round((TIKTOK_LOGO_H * 316) / 272);
const TIKTOK_TOP_INSET = 88;

let fontCache = null;
let logoCache = null;

async function loadAssets() {
  if (!fontCache) {
    const fontsDir = path.join(process.cwd(), "public/fonts");
    const [regular, semibold, bold] = await Promise.all([
      readFile(path.join(fontsDir, "REM-Regular.ttf")),
      readFile(path.join(fontsDir, "REM-SemiBold.ttf")),
      readFile(path.join(fontsDir, "REM-Bold.ttf")),
    ]);
    fontCache = { regular, semibold, bold };
  }
  if (!logoCache) {
    const logo = await readFile(
      path.join(process.cwd(), "public/blessedhouse_logo25.png")
    );
    logoCache = `data:image/png;base64,${logo.toString("base64")}`;
  }
  return { fonts: fontCache, logoSrc: logoCache };
}

function clipText(value, max) {
  const text = String(value || "").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function balancedTitleLines(value, maxChars) {
  const words = clipText(value, 90).split(/\s+/).filter(Boolean);
  if (words.length <= 1) return words.length ? words : [""];

  const lines = [];
  let current = [];
  let len = 0;
  for (const word of words) {
    const next = current.length ? len + 1 + word.length : word.length;
    if (current.length && next > maxChars) {
      lines.push(current);
      current = [word];
      len = word.length;
    } else {
      current.push(word);
      len = next;
    }
  }
  if (current.length) lines.push(current);

  while (lines.length >= 2) {
    const prev = lines[lines.length - 2];
    const last = lines[lines.length - 1];
    if ([...prev, ...last].join(" ").length <= maxChars) {
      lines.splice(lines.length - 2, 2, [...prev, ...last]);
      continue;
    }
    break;
  }

  while (lines.length >= 2 && lines[lines.length - 1].length === 1) {
    const last = lines.pop();
    const prev = lines[lines.length - 1];
    if (prev.length === 1) {
      prev.push(last[0]);
      break;
    }
    last.unshift(prev.pop());
    lines.push(last);
    if (last.length >= 2) break;
  }

  return lines.map((line) => line.join(" "));
}

function fitTitle(title, { boxWidth, baseSize, minSize, maxLines }) {
  let size = baseSize;
  while (size >= minSize) {
    const maxChars = Math.max(8, Math.floor(boxWidth / (size * 0.62)));
    const lines = balancedTitleLines(title, maxChars);
    const longest = Math.max(...lines.map((line) => line.length), 1);
    if (lines.length <= maxLines && longest * size * 0.62 <= boxWidth) {
      return { size, lines };
    }
    size -= 4;
  }

  const maxChars = Math.max(8, Math.floor(boxWidth / (minSize * 0.62)));
  return { size: minSize, lines: balancedTitleLines(title, maxChars) };
}

function layoutFor(platform) {
  const tabFooter = !platform.tallType;
  const tabInset = 40;
  const bottomPad = 40;
  const gap = 28;
  const titleSize = platform.tallType ? 104 : 72;
  const descriptionSize = 39;
  const tabHeight = Math.round(SQUARE_FOOTER.height);
  const topBar = platform.key === "tiktok";
  const topBarHeight = topBar ? 248 : 0;
  const sharedPhotoH = Math.round(
    (platform.width * SOCIAL_SHARED_PHOTO.height) / SOCIAL_SHARED_PHOTO.width
  );

  let photoH = sharedPhotoH;
  let footerHeight = tabHeight;
  let footerWidth = Math.min(SQUARE_FOOTER.width, platform.width - 40);

  if (tabFooter) {
    footerWidth = platform.width - tabInset * 2;
    footerHeight = tabHeight;
    photoH = platform.height - gap - footerHeight;
  } else if (topBar) {
    photoH = sharedPhotoH;
    footerHeight =
      platform.height - topBarHeight - gap * 2 - photoH - bottomPad;
  } else {
    photoH = sharedPhotoH;
    footerHeight = platform.height - photoH - gap - bottomPad;
  }

  return {
    photoW: platform.width,
    photoH,
    footerWidth,
    footerHeight,
    tabFooter,
    topBar,
    topBarHeight,
    tabInset,
    bottomPad,
    gap,
    titleSize,
    descriptionSize,
  };
}

function SocialCard({ platform, post, imageUrl, logoSrc }) {
  const layout = layoutFor(platform);
  const titleBoxWidth = layout.footerWidth - 72;
  const title = fitTitle(post.title, {
    boxWidth: titleBoxWidth,
    baseSize: layout.titleSize,
    minSize: platform.tallType ? 64 : 52,
    maxLines: 2,
  });
  const footerPadY = platform.tallType ? 40 : 20;
  const titleBlock = title.lines.length * title.size * 1.1;
  const descChars = platform.tallType ? clipText(post.description, 160).length : 0;
  const descPerLine = Math.max(20, Math.floor(titleBoxWidth / (layout.descriptionSize * 0.52)));
  const descBlock = platform.tallType
    ? 16 + Math.max(2, Math.ceil(descChars / descPerLine)) * layout.descriptionSize * 1.3
    : 0;
  const footerNeeded = Math.ceil(footerPadY * 2 + titleBlock + descBlock);
  if (!layout.tabFooter && footerNeeded > layout.footerHeight) {
    const extra = footerNeeded - layout.footerHeight;
    layout.photoH -= extra;
    layout.footerHeight += extra;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: SOCIAL_COLORS.green,
        color: SOCIAL_COLORS.cream,
        fontFamily: "REM",
        position: "relative",
        paddingBottom: layout.tabFooter ? 0 : layout.bottomPad,
        overflow: "hidden",
      }}
    >
      {layout.topBar ? (
        <div
          style={{
            width: "100%",
            height: layout.topBarHeight,
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: platform.width - TIKTOK_TOP_INSET * 2,
              minWidth: platform.width - TIKTOK_TOP_INSET * 2,
              maxWidth: platform.width - TIKTOK_TOP_INSET * 2,
              height: layout.topBarHeight,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: SOCIAL_COLORS.greenDeep,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: RADIUS,
              borderBottomRightRadius: RADIUS,
              border: `3px solid ${SOCIAL_COLORS.gold}`,
              paddingTop: 16,
              paddingBottom: 18,
            }}
          >
            <img
              src={logoSrc}
              alt=""
              width={TIKTOK_LOGO_W}
              height={TIKTOK_LOGO_H}
              style={{
                objectFit: "contain",
              }}
            />
            <div
              style={{
                display: "flex",
                marginTop: 10,
                backgroundColor: SOCIAL_COLORS.gold,
                color: SOCIAL_COLORS.greenDeep,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 1,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 18,
                paddingRight: 18,
                borderRadius: 999,
                textTransform: "uppercase",
              }}
            >
              {clipText(post.category || "Blessed House", 28)}
            </div>
          </div>
        </div>
      ) : null}

      <div
        style={{
          width: layout.photoW,
          height: layout.photoH,
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundColor: SOCIAL_COLORS.greenDeep,
          marginTop: layout.topBar ? layout.gap : 0,
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            width={layout.photoW}
            height={layout.photoH}
            style={{
              width: layout.photoW,
              height: layout.photoH,
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              color: SOCIAL_COLORS.cream,
            }}
          >
            No photo yet
          </div>
        )}
        {layout.topBar ? null : (
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 20,
              display: "flex",
              backgroundColor: SOCIAL_COLORS.gold,
              color: SOCIAL_COLORS.greenDeep,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 1,
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 20,
              paddingRight: 20,
              borderRadius: 999,
              textTransform: "uppercase",
            }}
          >
            {clipText(post.category || "Blessed House", 28)}
          </div>
        )}
        {layout.topBar ? null : (
          <img
            src={logoSrc}
            alt=""
            width={LOGO_W}
            height={LOGO_H}
            style={{
              position: "absolute",
              top: 20,
              right: 22,
              objectFit: "contain",
            }}
          />
        )}
      </div>

      <div
        style={
          layout.tabFooter
            ? {
                position: "relative",
                marginTop: layout.gap,
                width: layout.footerWidth,
                height: layout.footerHeight,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: SOCIAL_COLORS.greenDeep,
                borderTopLeftRadius: RADIUS,
                borderTopRightRadius: RADIUS,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                border: `3px solid ${SOCIAL_COLORS.gold}`,
                paddingTop: footerPadY,
                paddingBottom: footerPadY,
                paddingLeft: 36,
                paddingRight: 36,
              }
            : {
                position: "relative",
                marginTop: layout.gap,
                width: layout.footerWidth,
                height: layout.footerHeight,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: SOCIAL_COLORS.greenDeep,
                borderRadius: RADIUS,
                border: `3px solid ${SOCIAL_COLORS.gold}`,
                paddingTop: footerPadY,
                paddingBottom: footerPadY,
                paddingLeft: 36,
                paddingRight: 36,
              }
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            fontSize: title.size,
            fontWeight: 700,
            lineHeight: 1.1,
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            color: SOCIAL_COLORS.white,
          }}
        >
          {title.lines.map((line, index) => (
            <div key={`${index}-${line}`} style={{ display: "flex" }}>
              {line}
            </div>
          ))}
        </div>
        {platform.tallType ? (
          <div
            style={{
              display: "flex",
              width: "100%",
              marginTop: 16,
              fontSize: layout.descriptionSize,
              lineHeight: 1.3,
              textAlign: "center",
              justifyContent: "center",
              color: SOCIAL_COLORS.gold,
            }}
          >
            {clipText(post.description, 160)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export async function renderSocialPost({ platformKey, post, imageUrl }) {
  const platform = getSocialPlatform(platformKey);
  if (!platform) {
    throw new Error("Unknown social platform.");
  }

  const { fonts, logoSrc } = await loadAssets();

  const pngResponse = new ImageResponse(
    (
      <SocialCard
        platform={platform}
        post={post}
        imageUrl={imageUrl}
        logoSrc={logoSrc}
      />
    ),
    {
      width: platform.width,
      height: platform.height,
      fonts: [
        { name: "REM", data: fonts.regular, weight: 400, style: "normal" },
        { name: "REM", data: fonts.semibold, weight: 600, style: "normal" },
        { name: "REM", data: fonts.bold, weight: 700, style: "normal" },
      ],
    }
  );

  const jpeg = await sharp(Buffer.from(await pngResponse.arrayBuffer()))
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();

  return new NextResponse(jpeg, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "no-store",
      "Content-Disposition": `inline; filename="bh-${platform.key}-${post.slug || "sample"}.jpg"`,
    },
  });
}
