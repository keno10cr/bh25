"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { LEGAL_CONTENT, LEGAL_LAST_UPDATED } from "@/data/legal-content";
import styles from "./legal.module.css";

export default function LegalView() {
  const { language } = useLanguage();
  const content = LEGAL_CONTENT[language] || LEGAL_CONTENT.en;
  const updated = new Date(`${LEGAL_LAST_UPDATED}T12:00:00`).toLocaleDateString(
    LEGAL_CONTENT[language] ? language : "en",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <h1>{content.title}</h1>
        <p className={styles.updated}>
          {content.updatedLabel}: {updated}
        </p>
        <p className={styles.intro}>{content.intro}</p>
      </header>

      {content.sections.map((section) => (
        <section key={section.title} className={styles.section}>
          <h2>{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </section>
      ))}

      <footer className={styles.contact}>
        <p>{content.contactLabel}</p>
        <p>
          <a href="https://wa.me/50689262630" target="_blank" rel="noopener noreferrer">
            +506 8926 2630
          </a>
          {" · "}
          <a href="https://wa.me/17546104710" target="_blank" rel="noopener noreferrer">
            +1 (754) 610 4710
          </a>
          {" · "}
          <a href="mailto:blessedhousecr@gmail.com">blessedhousecr@gmail.com</a>
        </p>
      </footer>
    </article>
  );
}
