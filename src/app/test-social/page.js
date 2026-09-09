import { notFound } from "next/navigation";
import { getBlogPosts } from "@/lib/sanity/content";
import { SOCIAL_PLATFORMS } from "@/lib/social/platforms";
import { SOCIAL_SAMPLE_POST } from "@/lib/social/load-post";
import styles from "./test-social.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Social image preview",
  robots: { index: false, follow: false },
};

export default async function TestSocialPage({ searchParams }) {
  const params = await searchParams;
  if (process.env.NODE_ENV === "production") {
    const secret = process.env.SOCIAL_PREVIEW_SECRET;
    if (!secret || params?.secret !== secret) notFound();
  }

  const posts = await getBlogPosts();
  const slug = params?.slug || SOCIAL_SAMPLE_POST.slug;
  const selected =
    posts.find((post) => post.slug === slug) ||
    posts[0] ||
    SOCIAL_SAMPLE_POST;

  const platforms = Object.values(SOCIAL_PLATFORMS);

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
        {platforms.map((platform) => {
          const src = `/api/social/preview?platform=${platform.key}&slug=${encodeURIComponent(
            selected.slug
          )}`;
          return (
            <figure key={platform.key} className={styles.card}>
              <figcaption>
                {platform.order}. {platform.label}
                <span>
                  {platform.width} × {platform.height}
                </span>
              </figcaption>
              <img
                src={src}
                alt={`${platform.label} preview for ${selected.title}`}
                width={platform.width}
                height={platform.height}
              />
              <a href={src} download={`bh-${platform.key}-${selected.slug}.jpg`}>
                Download JPG
              </a>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
