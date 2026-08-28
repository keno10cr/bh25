import {
  normalizeWhatsIncludedFields,
  WHATS_INCLUDED_LOCALE_SUFFIXES,
} from "./whats-included.js";

export async function listActivityDraftIds(client) {
  return client.fetch(
    `*[_id in path("drafts.**") && _type == "activity"]._id`
  );
}

export async function deleteActivityDrafts(client) {
  const draftIds = await listActivityDraftIds(client);
  if (!Array.isArray(draftIds) || draftIds.length === 0) return 0;

  const transaction = client.transaction();
  draftIds.forEach((id) => transaction.delete(id));
  await transaction.commit();
  return draftIds.length;
}

export async function syncPublishedToDraft(client, publishedId) {
  const published = await client.getDocument(publishedId);
  if (!published) return false;

  const draftId = `drafts.${publishedId}`;
  const draft = await client.getDocument(draftId);
  if (!draft) return false;

  const syncFields = {};
  WHATS_INCLUDED_LOCALE_SUFFIXES.forEach((suffix) => {
    const fieldName = suffix ? `whatsIncluded${suffix}` : "whatsIncluded";
    if (Array.isArray(published[fieldName])) {
      syncFields[fieldName] = published[fieldName];
    }
  });

  if (Object.keys(syncFields).length === 0) return false;

  await client.patch(draftId).set(syncFields).commit();
  return true;
}

export async function reconcileActivityDrafts(client) {
  const publishedActivities = await client.fetch(
    `*[_type == "activity" && !(_id in path("drafts.**"))]{ _id }`
  );

  let synced = 0;
  for (const activity of publishedActivities || []) {
    const didSync = await syncPublishedToDraft(client, activity._id);
    if (didSync) synced += 1;
  }

  return synced;
}

export async function normalizeAllActivityWhatsIncluded(client) {
  const activities = await client.fetch(
    `*[_type == "activity" && !(_id in path("drafts.**"))]`
  );

  const transaction = client.transaction();
  let patches = 0;

  for (const activity of activities || []) {
    const patch = normalizeWhatsIncludedFields(activity, activity.slug || "activity");
    if (Object.keys(patch).length === 0) continue;
    transaction.patch(activity._id, { set: patch });
    patches += 1;
  }

  if (patches > 0) {
    await transaction.commit();
  }

  return patches;
}
