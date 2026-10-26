"use client";

import { useEffect, useState } from "react";
import styles from "./tools.module.css";

const STATUS_LABEL = { pass: "✓ Ready", warn: "! Check", fail: "✕ Will fail" };

const IMAGE_CARDS = [
  {
    key: "feed",
    platform: "instagram",
    title: "Instagram",
    size: "1080 × 1350",
    alsoFor: "Also used for Facebook, X, Bluesky and Google",
  },
  { key: "tiktok", platform: "tiktok", title: "TikTok", size: "1080 × 1920" },
  { key: "pinterest", platform: "pinterest", title: "Pinterest", size: "1000 × 1500" },
];

/** Accepts a slug or any blog link, e.g. https://www.blessedhouse.info/blog/my-post?x=1 */
function slugFromInput(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const match = /\/blog\/([^/?#\s]+)/.exec(text);
  const slug = match ? match[1] : text.replace(/^\/+|\/+$/g, "");
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** The image may live on another origin, so `<a download>` alone would just open it. */
async function downloadImage(url, filename) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blobUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}

function ImageCard({ card, image, slug }) {
  const [state, setState] = useState("idle");

  const download = async () => {
    setState("working");
    try {
      await downloadImage(image.url, `bh-${card.platform}-${slug}.jpg`);
      setState("idle");
    } catch {
      setState("failed");
    }
  };

  return (
    <figure className={styles.socialImage}>
      <figcaption className={styles.socialImageHead}>
        <strong>{card.title}</strong>
        <span>{card.size}</span>
      </figcaption>
      {image?.ok ? (
        <img src={image.url} alt={`${card.title} image`} loading="lazy" />
      ) : (
        <div className={styles.socialImageMissing}>Image did not load</div>
      )}
      <div className={styles.socialImageMeta}>
        {image?.ok ? (
          <span>
            {image.format.toUpperCase()} · {formatBytes(image.bytes)}
          </span>
        ) : (
          <span className={styles.textFail}>{image?.error}</span>
        )}
        {card.alsoFor ? <span>{card.alsoFor}</span> : null}
      </div>
      <div className={styles.toolActions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={download}
          disabled={!image?.ok || state === "working"}
        >
          {state === "working" ? "Downloading..." : "Download JPG"}
        </button>
        <a href={image?.url} className={styles.ghostButton} target="_blank" rel="noopener noreferrer">
          Open
        </a>
      </div>
      {state === "failed" ? (
        <p className={styles.textFail}>Download failed. Use Open, then save the image.</p>
      ) : null}
    </figure>
  );
}

function MakeTestPanel({ slug }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);
  const [error, setError] = useState("");

  const send = async () => {
    if (!slug || sending) return;
    const ok = window.confirm(
      `Send "${slug}" to Make.com as a test?\n\nThe payload includes is_test: true. Make.com only skips posting if the scenario has a filter that stops when is_test is true.`
    );
    if (!ok) return;
    setSending(true);
    setError("");
    setSent(null);
    try {
      const response = await fetch("/api/tools/social-test-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      setSent(data);
    } catch (err) {
      setError(err.message || "Could not send the test.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={styles.makeCard}>
      <div className={styles.makeCardHead}>
        <div>
          <h2>Make.com test post</h2>
          <p>
            Sends this blog post to our Make.com scenario exactly like a real
            publish, with <code>&quot;is_test&quot;: true</code> added. Use it to
            check the whole automation without waiting for a new post.
          </p>
          <p className={styles.makeWarning}>
            Make.com will post for real unless the scenario has a filter after the
            Router that only continues when <code>is_test</code> is not true.
          </p>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={send}
          disabled={!slug || sending}
        >
          {sending ? "Sending..." : "Send Test Post to Make.com"}
        </button>
      </div>

      {error ? <p className={styles.textFail}>{error}</p> : null}

      {sent ? (
        <div className={`${styles.verdict} ${styles.verdictReady}`} role="status">
          <span className={styles.verdictIcon} aria-hidden="true">✓</span>
          <span>
            Test payload for <strong>{sent.payload.slug}</strong> was sent to
            Make.com at {formatTime(sent.sentAt)}. Make.com replied:{" "}
            <strong>{sent.reply || `HTTP ${sent.status}`}</strong>. Open the
            scenario history in Make.com to see the run.
          </span>
        </div>
      ) : null}

      {sent ? (
        <details className={styles.payloadDetails}>
          <summary>Show the payload that was sent</summary>
          <pre className={styles.codeBlock}>{JSON.stringify(sent.payload, null, 2)}</pre>
        </details>
      ) : null}
    </section>
  );
}

export default function SocialCheck() {
  const [posts, setPosts] = useState([]);
  const [slug, setSlug] = useState("");
  const [target, setTarget] = useState("live");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const cleanSlug = slugFromInput(slug);

  useEffect(() => {
    fetch("/api/tools/social-check")
      .then((response) => (response.ok ? response.json() : { posts: [] }))
      .then((data) => {
        setPosts(data.posts || []);
        if (data.posts?.[0]?.slug) setSlug((current) => current || data.posts[0].slug);
      })
      .catch(() => setPosts([]));
  }, []);

  const run = async (event) => {
    event.preventDefault();
    if (!cleanSlug || running) return;
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const params = new URLSearchParams({ slug: cleanSlug });
      if (target === "this") params.set("target", "this");
      const response = await fetch(`/api/tools/social-check?${params}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      setResult(data);
    } catch (err) {
      setError(err.message || "Check failed.");
    } finally {
      setRunning(false);
    }
  };

  const copyPayload = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result.payload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={styles.toolPage}>
      <header className={styles.toolHeader}>
        <div>
          <p className={styles.eyebrow}>Social Media</p>
          <h1>📱 Social Media Image Checker</h1>
        </div>
      </header>

      <section className={styles.helpCard}>
        <h3>What this tool does</h3>
        <p>
          Before we publish a new blog post or announcement, this tool
          automatically tests all our social media images against rules for
          Instagram, Facebook, Pinterest, TikTok, Bluesky, X, and Google.
        </p>
        <h3>How to use it</h3>
        <ol className={styles.helpSteps}>
          <li>Paste the link or slug of a blog post.</li>
          <li>Click &lsquo;Check Images&rsquo;.</li>
          <li>
            Green checkmarks mean the post is 100% ready to share on all social
            media platforms without any errors!
          </li>
        </ol>
        <p className={styles.muted}>
          Checking never posts anything. You can also download each image with
          the Download JPG buttons to post it by hand.
        </p>
      </section>

      <form className={styles.socialForm} onSubmit={run}>
        <label className={styles.formField}>
          <span>Blog post link or slug</span>
          <input
            list="social-check-posts"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="https://www.blessedhouse.info/blog/..."
          />
          <datalist id="social-check-posts">
            {posts.map((post) => (
              <option key={post.slug} value={post.slug}>
                {post.scheduled ? `Scheduled: ${post.title}` : post.title}
              </option>
            ))}
          </datalist>
        </label>
        <label className={styles.formField}>
          <span>Check against</span>
          <select value={target} onChange={(event) => setTarget(event.target.value)}>
            <option value="live">Live site (what Make.com uses)</option>
            <option value="this">This deployment</option>
          </select>
        </label>
        <button type="submit" className={styles.primaryButton} disabled={running || !cleanSlug}>
          {running ? "Checking..." : "Check Images"}
        </button>
      </form>
      {running ? (
        <p className={styles.muted}>This can take up to 30 seconds. Please wait.</p>
      ) : null}
      {error ? <p className={styles.textFail}>{error}</p> : null}

      {result ? (
        <>
          {result.platforms.every((platform) => platform.status === "pass") ? (
            <p className={`${styles.verdict} ${styles.verdictReady}`} role="status">
              <span className={styles.verdictIcon} aria-hidden="true">✓</span>
              All green. This post is ready to share on every platform.
            </p>
          ) : (
            <p className={`${styles.verdict} ${styles.verdictNotReady}`} role="status">
              <span className={styles.verdictIcon} aria-hidden="true">!</span>
              Not ready yet:{" "}
              {result.platforms
                .filter((platform) => platform.status !== "pass")
                .map((platform) => platform.label)
                .join(", ")}
              . Please let the website team know before sharing.
            </p>
          )}

          <div className={styles.socialResults}>
            <section>
              <h2 className={styles.sectionTitle}>Images</h2>
              <div className={styles.socialImages}>
                {IMAGE_CARDS.map((card) => (
                  <ImageCard
                    key={card.key}
                    card={card}
                    image={result.images[card.key]}
                    slug={result.pack.slug}
                  />
                ))}
              </div>
              <p className={styles.muted}>
                Blog page: {result.blogPage.ok ? "loads" : `failed (${result.blogPage.error || `HTTP ${result.blogPage.status}`})`}
                {result.mainImage
                  ? ` · Featured photo: ${result.mainImage.ok ? "loads" : "failed"}`
                  : " · No featured photo"}
              </p>
            </section>

            <section>
              <h2 className={styles.sectionTitle}>Platform rules</h2>
              <ul className={styles.platformList}>
                {result.platforms.map((platform) => (
                  <li key={platform.id} className={`${styles.platformRow} ${styles[`status_${platform.status}`]}`}>
                    <div className={styles.platformHead}>
                      <strong>{platform.label}</strong>
                      <span className={styles.statusPill}>{STATUS_LABEL[platform.status]}</span>
                    </div>
                    {[...platform.issues, ...platform.warnings].map((line) => (
                      <p key={line} className={styles.platformLine}>{line}</p>
                    ))}
                    {platform.note ? <p className={styles.platformNote}>{platform.note}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      ) : null}

      <MakeTestPanel slug={cleanSlug} />

      {result ? (
        <section>
          <div className={styles.sectionHeadRow}>
            <h2 className={styles.sectionTitle}>Webhook payload</h2>
            <button type="button" className={styles.ghostButton} onClick={copyPayload}>
              {copied ? "Copied" : "Copy JSON"}
            </button>
          </div>
          <p className={styles.muted}>
            The same fields Sanity sends to Make.com when this post is first published.
          </p>
          <pre className={styles.codeBlock}>{JSON.stringify(result.payload, null, 2)}</pre>
        </section>
      ) : null}
    </div>
  );
}
