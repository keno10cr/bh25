"use client";

import { useMemo, useRef, useState } from "react";
import { translations } from "@/lib/translations";
import { PROPOSAL_COPY } from "./copy";
import {
  activityKey,
  applyMealCopy,
  applyTransportCopy,
  defaultSelectedKeys,
  formatGroupSize,
  mealHeadcount,
  parseGroupCount,
  partitionProposalActivities,
} from "./model";
import styles from "./proposal-generator.module.css";

const EMPTY = {
  organization: "",
  groupMin: "",
  groupMax: "30",
  note: "",
};

const DEFAULT_PHONES = [
  { label: "+506 8926 2630", tel: "+50689262630" },
  { label: "+1 (754) 610 4710", tel: "+17546104710" },
];

function phoneCountry(tel, locale) {
  if (tel.startsWith("+506")) return "Costa Rica";
  if (tel.startsWith("+1")) return locale === "es" ? "Estados Unidos" : "United States";
  return locale === "es" ? "Teléfono" : "Phone";
}

function safeFilename(value) {
  return String(value || "proposal")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || "proposal";
}

function backgroundImage(src) {
  const safe = String(src).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `url("${safe}")`;
}

function localizeActivity(activity, locale) {
  const pack = activity.translationKey
    ? translations[locale]?.activitiesPage?.[activity.translationKey]
    : null;
  const es = locale === "es";
  const included = es
    ? activity.whatsIncludedEs?.length
      ? activity.whatsIncludedEs
      : pack?.highlights
    : activity.whatsIncluded?.length
      ? activity.whatsIncluded
      : pack?.highlights;

  return {
    ...activity,
    displayTitle:
      (es
        ? activity.titleEs || pack?.name
        : activity.title || pack?.name) ||
      activity.name ||
      "",
    displayDescription:
      (es
        ? activity.descriptionEs || pack?.description || pack?.fullDescription
        : activity.description ||
          pack?.description ||
          activity.fullDescription) || "",
    displayIncluded: Array.isArray(included) ? included : [],
    displayDuration: es
      ? activity.durationEs || activity.duration
      : activity.duration,
    displayGroupSize: es
      ? activity.groupSizeEs || activity.groupSize
      : activity.groupSize,
  };
}

function CoverImage({ src, alt, className }) {
  if (!src) return null;
  return (
    <div
      className={className}
      role="img"
      aria-label={alt || undefined}
      style={{ backgroundImage: backgroundImage(src) }}
    />
  );
}

function ServiceCard({ activity }) {
  return (
    <article className={styles.serviceCard}>
      <CoverImage
        src={activity.image}
        alt={activity.imageAlt || activity.displayTitle}
        className={styles.serviceImage}
      />
      <div className={styles.serviceBody}>
        <h3>{activity.displayTitle}</h3>
        {activity.displayDescription ? (
          <p>{activity.displayDescription}</p>
        ) : null}
        <p className={styles.serviceMeta}>
          {[activity.displayDuration, activity.displayGroupSize]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {activity.displayIncluded.length > 0 ? (
          <ul className={styles.includeList}>
            {activity.displayIncluded.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

function ServiceSection({ title, items }) {
  if (items.length === 0) return null;
  const [first, ...rest] = items;

  return (
    <section className={styles.block}>
      <div className={styles.keepTogether}>
        <h2>{title}</h2>
        <ServiceCard activity={first} />
      </div>
      {rest.map((activity) => (
        <div key={activityKey(activity)} className={styles.cardSlot}>
          <ServiceCard activity={activity} />
        </div>
      ))}
    </section>
  );
}

export default function ProposalGenerator({
  locale = "en",
  activities = [],
  phones: phonesProp = [],
}) {
  const copy = PROPOSAL_COPY[locale] || PROPOSAL_COPY.en;
  const documentRef = useRef(null);
  const phones = phonesProp.length ? phonesProp : DEFAULT_PHONES;
  const [phoneTel, setPhoneTel] = useState(
    () => (phones.find((phone) => phone.tel.startsWith("+1")) || phones[0]).tel
  );
  const selectedPhone =
    phones.find((phone) => phone.tel === phoneTel) || phones[0];
  const [selectedKeys, setSelectedKeys] = useState(() =>
    defaultSelectedKeys(activities)
  );
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const organization =
    form.organization.trim() || copy.defaults.organization;
  const note = form.note.trim() || copy.defaults.note;
  const minParsed = parseGroupCount(form.groupMin);
  const maxParsed = parseGroupCount(form.groupMax);
  const minCount = minParsed.invalid ? null : minParsed.value;
  const maxCount = maxParsed.invalid ? null : maxParsed.value;
  const sizeLabel = formatGroupSize(minCount, maxCount, copy.guestUnit);
  const mealsFor = mealHeadcount(minCount, maxCount);

  const localized = useMemo(
    () => activities.map((activity) => localizeActivity(activity, locale)),
    [activities, locale]
  );
  const selected = useMemo(
    () => localized.filter((activity) => selectedKeys.includes(activityKey(activity))),
    [localized, selectedKeys]
  );
  const pickerGroups = useMemo(() => {
    const groups = partitionProposalActivities(localized);
    return [
      { id: "transport", label: copy.transportTitle, items: groups.transport },
      { id: "meals", label: copy.mealsTitle, items: groups.meals },
      { id: "local", label: copy.localTitle, items: groups.local },
    ].filter((group) => group.items.length > 0);
  }, [localized, copy.transportTitle, copy.mealsTitle, copy.localTitle]);
  const transport = useMemo(
    () =>
      partitionProposalActivities(selected).transport.map((activity) =>
        applyTransportCopy(activity, copy)
      ),
    [selected, copy]
  );
  const meals = useMemo(
    () =>
      partitionProposalActivities(selected).meals.map((activity) =>
        applyMealCopy(activity, mealsFor, copy)
      ),
    [selected, mealsFor, copy]
  );
  const localRows = useMemo(() => {
    const local = partitionProposalActivities(selected).local;
    const rows = [];
    for (let i = 0; i < local.length; i += 2) rows.push(local.slice(i, i + 2));
    return rows;
  }, [selected]);

  const documentTitle = useMemo(
    () => `${copy.titlePrefix} ${organization}`,
    [copy.titlePrefix, organization]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", groupSize: "" }));
    setDownloadError("");
  };

  const toggleActivity = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
    setDownloadError("");
  };

  const selectAllActivities = () => {
    setSelectedKeys(localized.map(activityKey).filter(Boolean));
    setDownloadError("");
  };

  const clearActivities = () => {
    setSelectedKeys([]);
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
    if (minParsed.invalid || maxParsed.invalid) {
      next.groupSize = copy.groupSizeInvalid;
    } else if (!minCount && !maxCount) {
      next.groupSize = copy.groupSizeRequired;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    if (!documentRef.current || downloading) return;

    setDownloading(true);
    setDownloadError("");
    const node = documentRef.current;
    node.classList.add(styles.exporting);

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
          pagebreak: {
            mode: ["css", "legacy"],
            avoid: [`.${styles.closing}`, `.${styles.cardSlot}`],
          },
        })
        .from(node)
        .save();
    } catch (error) {
      console.error("PDF download failed:", error);
      setDownloadError(copy.downloadError);
    } finally {
      node.classList.remove(styles.exporting);
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
            <label className={`${styles.field} ${styles.fieldWide}`}>
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

            <fieldset className={`${styles.optionField} ${styles.fieldWide}`}>
              <legend>{copy.groupSizeLabel}</legend>
              <div className={styles.sizeRow}>
                <label>
                  <span>{copy.groupMinLabel}</span>
                  <input
                    name="groupMin"
                    type="number"
                    min={1}
                    max={999}
                    inputMode="numeric"
                    value={form.groupMin}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  <span>{copy.groupMaxLabel}</span>
                  <input
                    name="groupMax"
                    type="number"
                    min={1}
                    max={999}
                    inputMode="numeric"
                    value={form.groupMax}
                    onChange={handleChange}
                    placeholder="45"
                  />
                </label>
              </div>
              <small className={styles.optionHint}>{copy.groupSizeHint}</small>
              {errors.groupSize ? (
                <em className={styles.error}>{errors.groupSize}</em>
              ) : null}
            </fieldset>

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

            <fieldset className={`${styles.optionField} ${styles.fieldWide}`}>
              <legend>{copy.phoneLabel}</legend>
              <div className={styles.segmented} role="radiogroup">
                {phones.map((phone) => (
                  <label
                    key={phone.tel}
                    className={`${styles.segment} ${
                      phone.tel === selectedPhone.tel ? styles.segmentActive : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="proposalPhone"
                      value={phone.tel}
                      checked={phone.tel === selectedPhone.tel}
                      onChange={() => setPhoneTel(phone.tel)}
                    />
                    <span className={styles.segmentCountry}>
                      {phoneCountry(phone.tel, locale)}
                    </span>
                    <span>{phone.label}</span>
                  </label>
                ))}
              </div>
              <small className={styles.optionHint}>{copy.phoneHint}</small>
            </fieldset>

            <fieldset className={`${styles.optionField} ${styles.fieldWide}`}>
              <legend>{copy.activitiesLabel}</legend>
              <div className={styles.pickerHeader}>
                <small className={styles.optionHint}>{copy.activitiesHint}</small>
                <div className={styles.pickerActions}>
                  <button type="button" onClick={selectAllActivities}>
                    {copy.selectAll}
                  </button>
                  <button type="button" onClick={clearActivities}>
                    {copy.selectNone}
                  </button>
                </div>
              </div>
              <div className={styles.picker}>
                {pickerGroups.map((group) => (
                  <div key={group.id} className={styles.pickerGroup}>
                    <p className={styles.pickerGroupTitle}>{group.label}</p>
                    {group.items.map((activity) => {
                      const key = activityKey(activity);
                      return (
                        <label key={key} className={styles.pickerItem}>
                          <input
                            type="checkbox"
                            checked={selectedKeys.includes(key)}
                            onChange={() => toggleActivity(key)}
                          />
                          <span>{activity.displayTitle || key}</span>
                          {activity.category ? (
                            <span className={styles.pickerMeta}>
                              {activity.category}
                            </span>
                          ) : null}
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>
            </fieldset>
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
          <p className={styles.capacity}>
            {sizeLabel ? copy.capacity(sizeLabel) : copy.capacity("—")}
          </p>

          <section className={`${styles.block} ${styles.keepTogether}`}>
            <h2>{copy.valueTitle}</h2>
            <p>{copy.valueBody}</p>
          </section>

          <section className={`${styles.block} ${styles.keepTogether}`}>
            <h2>{copy.includesTitle}</h2>
            <p>{copy.includesBody}</p>
          </section>

          {transport.length > 0 ? (
            <ServiceSection title={copy.transportTitle} items={transport} />
          ) : null}
          {meals.length > 0 ? (
            <ServiceSection title={copy.mealsTitle} items={meals} />
          ) : null}

          {localRows.length > 0 ? (
            <section className={styles.block}>
              {localRows.map((row, index) => {
                const grid = (
                  <div
                    key={row.map((activity) => activityKey(activity)).join("|")}
                    className={`${styles.localGrid} ${styles.keepTogether}`}
                  >
                    {row.map((activity) => (
                      <article
                        key={activityKey(activity)}
                        className={styles.localItem}
                      >
                        <CoverImage
                          src={activity.image}
                          alt={activity.imageAlt || activity.displayTitle}
                          className={styles.localImage}
                        />
                        <p>{activity.displayTitle}</p>
                      </article>
                    ))}
                  </div>
                );
                return index === 0 ? (
                  <div key="first" className={styles.keepTogether}>
                    <h2>{copy.localTitle}</h2>
                    {grid}
                  </div>
                ) : (
                  grid
                );
              })}
              <p className={styles.viewAllWrap}>
                <a
                  href={copy.viewAllActivitiesHref}
                  className={styles.nextLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.viewAllActivitiesLabel}
                </a>
              </p>
            </section>
          ) : null}
        </div>

        <div className={styles.closing}>
          <div className={styles.closingBody}>
            <section className={styles.block}>
              <h2>{copy.focusTitle}</h2>
              <p>{note}</p>
            </section>

            <section className={`${styles.block} ${styles.nextBlock}`}>
              <div className={styles.nextRow}>
                <div className={styles.nextCopy}>
                  <h2>{copy.nextTitle}</h2>
                  <p>{copy.nextBody}</p>
                  <p className={styles.contactLine}>
                    <strong>{copy.contactName}</strong>
                    <br />
                    {selectedPhone.label}
                    <br />
                    {copy.contactEmail}
                  </p>
                </div>
                <div className={styles.nextAction}>
                  <a
                    href={copy.nextLinkHref}
                    className={styles.nextButton}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {copy.nextLinkLabel}
                  </a>
                </div>
              </div>
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
              {selectedPhone.label}
              <span className={styles.footerDot}>·</span>
              {copy.contactEmail}
            </p>
            <p className={styles.footerMeta}>{copy.contactLocation}</p>
          </footer>
        </div>
      </article>
    </div>
  );
}
