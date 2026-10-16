"use client";

import { useEffect, useRef, useState } from "react";
import { useClient } from "sanity";
import { useToast } from "@sanity/ui/toast";
import { TranslateIcon } from "@sanity/icons/Translate";
import { CAPTION_LOCALE_FIELDS } from "../../src/lib/caption-locales";
import {
  buildCaptionPatch,
  captionPatchSet,
} from "../../src/lib/property-caption-sync";

function openDocument(props) {
  return props.version || props.draft || props.published || null;
}

function translationPayload(doc) {
  const slug = typeof doc.slug === "string" ? doc.slug : doc.slug?.current || "";
  const gallery = (Array.isArray(doc.gallery) ? doc.gallery : []).map((image) => {
    const item = {
      _key: image?._key,
      caption: image?.caption || "",
      captionTranslatedFrom: image?.captionTranslatedFrom || "",
    };
    if (typeof image?.filename === "string") item.filename = image.filename;
    for (const field of Object.values(CAPTION_LOCALE_FIELDS)) {
      item[field] = image?.[field] || "";
    }
    return item;
  });
  return { slug, gallery };
}

function savedOnDraft(doc) {
  const id = String(doc?._id || "");
  return id.startsWith("drafts.") || id.startsWith("versions.");
}

function failureText(error) {
  const message = String(error?.message || "");
  if (/permission|insufficient/i.test(message)) {
    return "Your Studio login cannot edit this property.";
  }
  return "Could not translate captions. Try again, or run npm run translate:captions.";
}

async function translateOnServer(token, doc) {
  const response = await fetch("/api/studio/translate-captions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(translationPayload(doc)),
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Could not translate captions.");
  return response.json();
}

/**
 * Property document action. Translates English photo captions into the
 * other seven site languages. Captions that are already current are skipped.
 */
export function TranslateCaptionsAction(props) {
  const client = useClient({ apiVersion: "2025-08-01" });
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const mounted = useRef(true);
  const target = openDocument(props);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  if (props.type !== "property") return null;

  const finish = (status, description) => {
    toast.push({ status, title: "Translate Captions", description });
  };

  return {
    label: busy ? "Translating…" : "Translate Captions",
    icon: TranslateIcon,
    disabled: busy || !props.ready || !target?._id,
    title: "Translate English photo captions that are new, missing, or changed",
    onHandle: () => {
      const doc = openDocument(props);
      if (!doc?._id || busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      const token = String(client.config?.().token || "").trim();
      const work = (async () => {
        const serverResult = token ? await translateOnServer(token, doc) : null;
        const result = serverResult || (await buildCaptionPatch(doc, {}));
        const set = captionPatchSet(result.set);
        if (Object.keys(set).length) {
          await client.patch(doc._id).set(set).commit();
        }
        return { ...result, saved: Object.keys(set).length > 0 };
      })();

      work
        .then((result) => {
          if (!mounted.current) return;
          const translated = Number(result.translated) || 0;
          if (!result.examined) {
            finish(
              "warning",
              "This property has no English captions to translate. Photos without a caption keep the usual label."
            );
            return;
          }
          if (!translated) {
            finish("success", "Captions are already up to date.");
            return;
          }
          if (!result.saved) {
            finish("error", "Could not save the translations.");
            return;
          }
          finish(
            "success",
            savedOnDraft(doc)
              ? `Translated ${translated} caption${translated === 1 ? "" : "s"} on this draft. Publish the property to show them on the site.`
              : `Translated ${translated} caption${translated === 1 ? "" : "s"}. They will show on the site within a minute.`
          );
        })
        .catch((error) => {
          if (!mounted.current) return;
          finish("error", failureText(error));
        })
        .finally(() => {
          busyRef.current = false;
          if (mounted.current) setBusy(false);
        });
    },
  };
}
