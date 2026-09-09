import { notFound } from "next/navigation";
import { getBlogPosts } from "@/lib/sanity/content";
import { SOCIAL_PLATFORMS } from "@/lib/social/platforms";
import { SOCIAL_SAMPLE_POST } from "@/lib/social/load-post";
import { socialPageSecretAllowed } from "@/lib/social/auth";
import styles from "./test-social.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Social image preview",
  robots: { index: false, follow: false },
};

function PreviewCard({
  platforms,
  previewPlatform,
  slug,
  title,
  styles,
}) {
  const items = Array.isArray(platforms) ? platforms : [platforms];
  const source = previewPlatform || items[0];
  const src = `/api/social/preview?platform=${source.key}&slug=${encodeURIComponent(
    slug
  )}`;
  const caption = items
    .map((platform) => `${platform.previewNumber}. ${platform.shortLabel}`)
    .join("  ");

  return (
    <figure className={styles.card}>
      <figcaption>
        <span className={styles.titles}>{caption}</span>
        <span>
          {source.width} × {source.height}
        </span>
      </figcaption>
      <img
        src={src}
        alt={`Social preview for ${title}`}
        width={source.width}
        height={source.height}
      />
      <a href={src} download={`bh-${source.key}-${slug}.jpg`}>
        Download JPG
      </a>
    </figure>
  );
}

export default async function TestSocialPage({ searchParams }) {
  const params = await searchParams;
  if (!socialPageSecretAllowed(params?.secret)) notFound();

  const posts = await getBlogPosts();
  const slug = params?.slug || SOCIAL_SAMPLE_POST.slug;
  const selected =
    posts.find((post) => post.slug === slug) ||
    posts[0] ||
    SOCIAL_SAMPLE_POST;

  const feedPlatforms = [
    { ...SOCIAL_PLATFORMS.instagram, previewNumber: 1, shortLabel: "IG" },
    { ...SOCIAL_PLATFORMS.facebook, previewNumber: 2, shortLabel: "FB" },
    { ...SOCIAL_PLATFORMS.x, previewNumber: 3, shortLabel: "X" },
    { ...SOCIAL_PLATFORMS.bluesky, previewNumber: 4, shortLabel: "Bluesky" },
  ];
  const tiktok = {
    ...SOCIAL_PLATFORMS.tiktok,
    previewNumber: 5,
    shortLabel: "TikTok",
  };
  const pinterest = {
    ...SOCIAL_PLATFORMS.pinterest,
    previewNumber: 6,
    shortLabel: "Pinterest",
  };

  return (
    <div className={styles.page}>
      <h1>Social image preview</h1>
      <p>
        Local test for branded posts. Photos fill the card with a cover crop. Each
        file downloads as a JPG.
      </p>

      <form method="get" className={styles.form}>
        <label htmlFor="slug">Blog post</label>
        <select id="slug" name="slug" defaultValue={selected.slug}>
          {posts.map((post) => (
            <option key={post.slug} value={post.slug}>
              {post.title}
            </option>
          ))}
        </select>
        <button type="submit">Preview</button>
      </form>

      <p className={styles.meta}>
        <strong>{selected.title}</strong>
        {selected.category ? ` · ${selected.category}` : ""}
        {selected.socialTitle ? (
          <>
            <br />
            Social title: {selected.socialTitle}
          </>
        ) : null}
      </p>

      <div className={styles.grid}>
        <div className={styles.column}>
          <PreviewCard
            platforms={feedPlatforms}
            previewPlatform={feedPlatforms[0]}
            slug={selected.slug}
            title={selected.title}
            styles={styles}
          />
        </div>
        <div className={styles.column}>
          <PreviewCard
            platforms={tiktok}
            slug={selected.slug}
            title={selected.title}
            styles={styles}
          />
        </div>
        <div className={styles.column}>
          <PreviewCard
            platforms={pinterest}
            slug={selected.slug}
            title={selected.title}
            styles={styles}
          />
        </div>
      </div>
    </div>
  );
}
