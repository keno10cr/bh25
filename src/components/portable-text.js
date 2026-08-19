import { PortableText } from "@portabletext/react";
import styles from "./portable-text.module.css";

const components = {
  marks: {
    link: ({ value, children }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
};

export default function PortableBody({ value }) {
  if (!value) return null;
  if (typeof value === "string") {
    return <p className={styles.paragraph}>{value}</p>;
  }
  return (
    <div className={styles.body}>
      <PortableText value={value} components={components} />
    </div>
  );
}
