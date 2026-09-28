/** Both post types live under /blog/{slug}, so slugs must be unique across them. */
export const BLOG_POST_TYPES = ["blog", "familyBlog"];

export function slugifyBlogTitle(input) {
  return String(input || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 96)
    .replace(/-+$/g, "");
}

export async function isUniqueBlogSlug(slug, context) {
  const client = context.getClient({ apiVersion: "2025-08-01" });
  const id = String(context.document?._id || "").replace(/^drafts\./, "");
  const count = await client.fetch(
    `count(*[_type in $types && slug.current == $slug && !(_id in [$id, $draftId])])`,
    { types: BLOG_POST_TYPES, slug, id, draftId: `drafts.${id}` }
  );
  return count === 0;
}
