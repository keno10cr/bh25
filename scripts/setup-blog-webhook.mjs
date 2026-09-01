/**
 * Create or replace the Sanity webhook that notifies Make.com when a
 * blog document is first published (not drafts, not later edits).
 *
 * Requires a Sanity token with webhook manage access. The dataset write
 * token is not enough. This script uses SANITY_AUTH_TOKEN if set, otherwise
 * the token from `npx sanity debug --secrets` (you must be logged in).
 *
 * Run: npm run webhook:blog
 */
import { execSync } from "node:child_process";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";
import { SITE_URL } from "../src/lib/siteMetadata.js";

const WEBHOOK_NAME = "Blog published to Make.com";
const MAKE_WEBHOOK_URL = process.env.MAKE_BLOG_WEBHOOK_URL;
const API_VERSION = "v2025-02-19";
const HOOKS_URL = `https://${sanityProjectId}.api.sanity.io/${API_VERSION}/hooks/projects/${sanityProjectId}`;

const FILTER = '_type == "blog"';

const PROJECTION = `{
  title,
  "slug": slug.current,
  "mainImageUrl": featuredImage.asset->url,
  "description": excerpt,
  "url": "${SITE_URL}/blog/" + slug.current,
  category
}`;

function getAuthToken() {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN;

  const output = execSync("npx sanity debug --secrets", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const match = output.match(/Auth token:\s+(\S+)/);
  if (!match) {
    throw new Error(
      "Could not find a Sanity auth token. Log in with `npx sanity login` or set SANITY_AUTH_TOKEN."
    );
  }
  return match[1];
}

async function sanityFetch(token, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    const message =
      (body && body.message) || text || `${response.status} ${response.statusText}`;
    throw new Error(message);
  }
  return body;
}

function webhookBody() {
  return {
    type: "document",
    name: WEBHOOK_NAME,
    url: MAKE_WEBHOOK_URL,
    dataset: sanityDataset,
    description:
      "Sends title, slug, main image, description, and post URL to Make.com when a blog post is first published, for social sharing.",
    rule: {
      on: ["create"],
      filter: FILTER,
      projection: PROJECTION,
    },
    apiVersion: sanityApiVersion.startsWith("v")
      ? sanityApiVersion
      : `v${sanityApiVersion}`,
    httpMethod: "POST",
    includeDrafts: false,
    includeAllVersions: false,
  };
}

async function main() {
  if (!MAKE_WEBHOOK_URL) {
    throw new Error("Missing MAKE_BLOG_WEBHOOK_URL in .env.local");
  }

  const token = getAuthToken();
  const existing = await sanityFetch(token, HOOKS_URL);
  const current = (existing || []).find((hook) => hook.name === WEBHOOK_NAME);

  if (current?.id) {
    await sanityFetch(token, `${HOOKS_URL}/${current.id}`, { method: "DELETE" });
    console.log(`Removed existing webhook ${current.id}`);
  }

  const created = await sanityFetch(token, HOOKS_URL, {
    method: "POST",
    body: JSON.stringify(webhookBody()),
  });

  console.log("Sanity webhook is ready.");
  console.log(`  id:       ${created.id}`);
  console.log(`  name:     ${created.name}`);
  console.log(`  dataset:  ${created.dataset}`);
  console.log(`  trigger:  first publish of _type == "blog"`);
  console.log(`  payload:  title, slug, mainImageUrl, description, url, category`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
