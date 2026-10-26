"use client";

import { useState } from "react";
import styles from "./tools.module.css";

export default function PvgPreview({ links }) {
  const [activeId, setActiveId] = useState(links[0]?.id);
  const [copiedId, setCopiedId] = useState("");
  const active = links.find((link) => link.id === activeId) || links[0];
  const previewPath = (() => {
    const url = new URL(active.url);
    return `${url.pathname}${url.search}`;
  })();

  const copy = async (link) => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(""), 1800);
    } catch {
      setCopiedId("");
    }
  };

  return (
    <div className={styles.toolPage}>
      <header className={styles.toolHeader}>
        <div>
          <p className={styles.eyebrow}>PVG</p>
          <h1>Public group request page</h1>
          <p className={styles.lead}>
            This is exactly what groups see from the email. The date picker
            shades days where some villas are booked and days that are fully
            booked, without showing which villa or guest.
          </p>
        </div>
      </header>

      <div className={styles.linkRow}>
        {links.map((link) => (
          <div key={link.id} className={styles.linkChip}>
            <button
              type="button"
              className={`${styles.chipTab} ${
                link.id === active.id ? styles.chipTabActive : ""
              }`}
              onClick={() => setActiveId(link.id)}
            >
              {link.label}
            </button>
            <code>{link.url}</code>
            <button
              type="button"
              className={styles.ghostButton}
              onClick={() => copy(link)}
            >
              {copiedId === link.id ? "Copied" : "Copy link"}
            </button>
            <a
              href={link.url}
              className={styles.ghostButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open
            </a>
          </div>
        ))}
      </div>

      <iframe
        key={previewPath}
        src={previewPath}
        title="PVG preview"
        className={styles.previewFrame}
      />
    </div>
  );
}
