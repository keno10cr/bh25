"use client";

import { useRef, useState } from "react";
import { insert, set, setIfMissing, unset, useClient } from "sanity";
import { Button, Card, Text } from "@sanity/ui";
import {
  DEFAULT_FAMILY_PHOTO_SHAPE,
  FAMILY_PHOTO_SHAPES,
  resizeFamilyPhoto,
} from "../lib/familyPhoto";

function randomKey() {
  return Math.random().toString(36).slice(2, 12);
}

function useFamilyPhotoUpload() {
  const client = useClient({ apiVersion: "2025-08-01" });
  return async (file, shapeId) => {
    const { blob, filename } = await resizeFamilyPhoto(file, shapeId);
    const asset = await client.assets.upload("image", blob, {
      filename,
      contentType: "image/jpeg",
    });
    return asset._id;
  };
}

const inputColumn = { display: "flex", flexDirection: "column", gap: 20 };
const cardColumn = { display: "flex", flexDirection: "column", gap: 18 };
const stepGroup = { display: "flex", flexDirection: "column", gap: 12 };
const buttonRow = { display: "flex", flexWrap: "wrap", gap: 10 };

function ShapePicker({ shape, onChange, disabled }) {
  return (
    <div style={buttonRow}>
      {FAMILY_PHOTO_SHAPES.map((option) => {
        const active = option.id === shape;
        return (
          <Button
            key={option.id}
            text={option.label}
            mode={active ? "default" : "ghost"}
            tone={active ? "primary" : "default"}
            fontSize={1}
            padding={3}
            disabled={disabled}
            onClick={() => onChange(option.id)}
          />
        );
      })}
    </div>
  );
}

function UploaderCard({
  shape,
  onShapeChange,
  buttonText,
  multiple,
  busy,
  status,
  error,
  readOnly,
  onFiles,
}) {
  const fileInput = useRef(null);
  return (
    <Card padding={4} radius={2} border tone="primary">
      <div style={cardColumn}>
        <div style={stepGroup}>
          <Text size={1} weight="semibold">
            1. Pick the shape of the photo
          </Text>
          <ShapePicker shape={shape} onChange={onShapeChange} disabled={busy || readOnly} />
        </div>
        <div style={stepGroup}>
          <Text size={1} weight="semibold">
            2. Choose the photo{multiple ? "s" : ""}
          </Text>
          <div style={buttonRow}>
            <Button
              text={buttonText}
              tone="primary"
              padding={3}
              loading={busy}
              disabled={busy || readOnly}
              onClick={() => fileInput.current?.click()}
            />
          </div>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple={multiple}
          hidden
          onChange={(event) => {
            const files = Array.from(event.target.files || []);
            event.target.value = "";
            if (files.length) onFiles(files);
          }}
        />
        <Text size={1} muted>
          The photo is centered, cropped to the shape you picked, and saved as a
          light JPG. Big phone photos are fine.
        </Text>
        {status ? <Text size={1}>{status}</Text> : null}
        {error ? (
          <Card padding={3} radius={2} tone="critical">
            <Text size={1}>{error}</Text>
          </Card>
        ) : null}
      </div>
    </Card>
  );
}

/** Single image field: resize, upload, then show the default preview + alt field. */
export function FamilyPhotoInput(props) {
  const { value, onChange, schemaType, readOnly, renderDefault } = props;
  const upload = useFamilyPhotoUpload();
  const [shape, setShape] = useState(DEFAULT_FAMILY_PHOTO_SHAPE);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const hasPhoto = Boolean(value?.asset?._ref);

  async function handleFiles([file]) {
    setBusy(true);
    setError("");
    setStatus("Resizing and uploading the photo...");
    try {
      const assetId = await upload(file, shape);
      onChange([
        setIfMissing({ _type: schemaType.name }),
        set({ _type: "reference", _ref: assetId }, ["asset"]),
        unset(["hotspot"]),
        unset(["crop"]),
      ]);
      setStatus("Photo ready. Add the alt text below.");
    } catch (err) {
      setStatus("");
      setError(err?.message || "The photo could not be uploaded.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={inputColumn}>
      <UploaderCard
        shape={shape}
        onShapeChange={setShape}
        buttonText={hasPhoto ? "Replace photo" : "Choose photo"}
        multiple={false}
        busy={busy}
        status={status}
        error={error}
        readOnly={readOnly}
        onFiles={handleFiles}
      />
      {hasPhoto ? renderDefault(props) : null}
    </div>
  );
}

/** Array of images: pick many photos at once, resize each, append to the list. */
export function FamilyGalleryInput(props) {
  const { onChange, readOnly, renderDefault } = props;
  const upload = useFamilyPhotoUpload();
  const [shape, setShape] = useState(DEFAULT_FAMILY_PHOTO_SHAPE);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function handleFiles(files) {
    setBusy(true);
    setError("");
    const failed = [];
    let added = 0;
    for (const [index, file] of files.entries()) {
      setStatus(`Resizing and uploading photo ${index + 1} of ${files.length}...`);
      try {
        const assetId = await upload(file, shape);
        onChange([
          setIfMissing([]),
          insert(
            [
              {
                _type: "image",
                _key: randomKey(),
                asset: { _type: "reference", _ref: assetId },
              },
            ],
            "after",
            [-1]
          ),
        ]);
        added += 1;
      } catch (err) {
        failed.push(`${file.name}: ${err?.message || "could not be uploaded"}`);
      }
    }
    setStatus(
      added
        ? `${added} photo${added === 1 ? "" : "s"} added. Click each one to add its alt text.`
        : ""
    );
    if (failed.length) setError(failed.join(" "));
    setBusy(false);
  }

  return (
    <div style={inputColumn}>
      <UploaderCard
        shape={shape}
        onShapeChange={setShape}
        buttonText="Add photos"
        multiple
        busy={busy}
        status={status}
        error={error}
        readOnly={readOnly}
        onFiles={handleFiles}
      />
      {renderDefault(props)}
    </div>
  );
}
