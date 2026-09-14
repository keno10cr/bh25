"use client";

import { useMemo, useRef, useState } from "react";
import { PROPOSAL_COPY } from "./copy";
import styles from "./proposal-generator.module.css";

const EMPTY = {
  organization: "",
  pax: "30",
  note: "",
};

function safeFilename(value) {
  return String(value || "proposal")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || "proposal";
}

export default function ProposalGenerator({ locale = "en" }) {
  const copy = PROPOSAL_COPY[locale] || PROPOSAL_COPY.en;
  const documentRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const organization =
    form.organization.trim() || copy.defaults.organization;
  const note = form.note.trim() || copy.defaults.note;
  const paxNumber = Number(form.pax);
  const paxValid =
    Number.isFinite(paxNumber) && paxNumber >= 20 && paxNumber <= 45;
  const pax = paxValid ? String(Math.round(paxNumber)) : "30";

  const documentTitle = useMemo(
    () => `${copy.titlePrefix} ${organization}`,
    [copy.titlePrefix, organization]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setDownloadError("");
  };

  const validate = () => {
    const next = {};
    if (!form.organization.trim()) {
      next.organization =
        locale === "es"
          ? "Ingrese el nombre de la organización."
          : "Enter the organization name.";
    }
    if (!form.pax) {
      next.pax =
        locale === "es"
          ? "Ingrese la cantidad de personas."
          : "Enter estimated pax.";
    } else if (!paxValid) {
      next.pax =
        locale === "es"
          ? "Use un número entre 20 y 45."
          : "Use a number between 20 and 45.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    if (!documentRef.current || downloading) return;

    setDownloading(true);
    setDownloadError("");

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const filename = `${safeFilename(copy.printHeader)}-${safeFilename(
        organization
      )}.pdf`;

      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(documentRef.current)
        .save();
    } catch (error) {
      console.error("PDF download failed:", error);
      setDownloadError(copy.downloadError);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.panel} aria-label={copy.panelTitle}>
        <div className={styles.panelInner}>
          <div className={styles.panelIntro}>
            <p className={styles.panelBrand}>{copy.brandLine}</p>
            <h1 className={styles.panelTitle}>{copy.panelTitle}</h1>
            <p className={styles.panelHint}>{copy.panelHint}</p>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>{copy.organizationLabel}</span>
              <input
                name="organization"
                value={form.organization}
                onChange={handleChange}
                autoComplete="organization"
              />
              {errors.organization ? (
                <em className={styles.error}>{errors.organization}</em>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>{copy.paxLabel}</span>
              <input
                name="pax"
                type="number"
                min={20}
                max={45}
                value={form.pax}
                onChange={handleChange}
              />
              {errors.pax ? (
                <em className={styles.error}>{errors.pax}</em>
              ) : null}
            </label>

            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>{copy.noteLabel}</span>
              <textarea
                name="note"
                rows={3}
                value={form.note}
                onChange={handleChange}
                placeholder={copy.notePlaceholder}
              />
            </label>
          </div>

          {downloadError ? (
            <p className={styles.downloadError}>{downloadError}</p>
          ) : null}

          <button
            type="button"
            className={styles.generate}
            onClick={handleGenerate}
            disabled={downloading}
          >
            {downloading ? copy.generatingButton : copy.generateButton}
          </button>
        </div>
      </section>

      <article
        ref={documentRef}
        className={styles.document}
        aria-label={documentTitle}
      >
        <p className={styles.pdfHeader}>{copy.printHeader}</p>
        <header className={styles.docHero}>
          <img
            src="/BannerVilla4.jpg"
            alt={copy.brandLine}
            className={styles.docHeroImage}
          />
          <div className={styles.docHeroShade} />
          <div className={styles.docHeroCopy}>
            <img
              src="/blessedhouse_logo25.png"
              alt={copy.brandLine}
              className={styles.docHeroLogo}
            />
            <p className={styles.docBrand}>{copy.brandLine}</p>
          </div>
        </header>

        <div className={styles.docBody}>
          <h1 className={styles.docTitle}>{documentTitle}</h1>
          <p className={styles.capacity}>{copy.capacity(pax)}</p>

          <section className={styles.block}>
            <h2>{copy.valueTitle}</h2>
            <p>{copy.valueBody}</p>
          </section>

          <section className={styles.block}>
            <h2>{copy.includesTitle}</h2>
            <p>{copy.includesBody}</p>
          </section>

          <section className={`${styles.block} ${styles.pageTwo}`}>
            <h2>{copy.focusTitle}</h2>
            <p>{note}</p>
          </section>

          <section className={`${styles.block} ${styles.nextBlock}`}>
            <h2>{copy.nextTitle}</h2>
            <p>{copy.nextBody}</p>
            <p className={styles.nextLinkWrap}>
              <a
                href={copy.nextLinkHref}
                className={styles.nextLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {copy.nextLinkLabel}
              </a>
            </p>
            <p className={styles.contactLine}>
              <strong>{copy.contactName}</strong>
              <br />
              {copy.contactPhone}
              <br />
              {copy.contactEmail}
            </p>
          </section>
        </div>

        <footer className={styles.docFooter}>
          <img
            src="/blessedhouse_logo25.png"
            alt={copy.brandLine}
            className={styles.footerLogo}
          />
          <p className={styles.footerBrand}>{copy.brandLine}</p>
          <p className={styles.footerMeta}>
            <a href="https://www.blessedhouse.info">{copy.contactWeb}</a>
          </p>
          <p className={styles.footerMeta}>
            {copy.contactPhone}
            <span className={styles.footerDot}>·</span>
            {copy.contactEmail}
          </p>
          <p className={styles.footerMeta}>{copy.contactLocation}</p>
        </footer>
      </article>
    </div>
  );
}
