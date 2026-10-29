"use client";

import { useState } from "react";
import styles from "./tools.module.css";

export default function EmailNote({ label, text }) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <aside className={styles.emailNote}>
      <div className={styles.emailNoteHead}>
        <strong>{label}</strong>
        <button type="button" className={styles.copyButton} onClick={copyText}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p>{text}</p>
    </aside>
  );
}
