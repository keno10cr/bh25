"use client";

import { useState } from "react";
import { useFormValue } from "sanity";
import { Button, Stack, Text, TextInput } from "@sanity/ui";
import { SITE_URL } from "../../src/lib/siteMetadata";

function slugText(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object" && value.current) return String(value.current).trim();
  return "";
}

export function WebsiteIcalUrlInput() {
  const slug = slugText(useFormValue(["slug"]));
  const url = slug ? `${SITE_URL}/api/ical/${slug}` : "";
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Stack space={3}>
      <TextInput
        value={url}
        readOnly
        onChange={() => {}}
        placeholder="Add a slug to generate the export link."
      />
      {url ? (
        <Button
          mode="ghost"
          text={copied ? "Copied" : "Copy link"}
          onClick={copyLink}
        />
      ) : (
        <Text size={1} muted>
          Add a slug and publish the villa. The export link appears here.
        </Text>
      )}
    </Stack>
  );
}
