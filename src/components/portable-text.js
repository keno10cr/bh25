import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/lib/sanity/image";
import styles from "./portable-text.module.css";

function portableComponents(fallbackImageAlt) {
  return {
    types: {
      image: ({ value }) => {
        if (!value?.asset) return null;
        const src = urlForImage(value)?.width(1600).auto("format").url();
        if (!src) return null;
        const alt = String(value.alt || "").trim() || fallbackImageAlt || "";
        return <img src={src} alt={alt} className={styles.image} />;
      },
    },
    marks: {
      link: ({ value, children }) => (
        <a href={value?.href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
    },
  };
}

export default function PortableBody({ value, imageAlt = "" }) {
  if (!value) return null;
  if (typeof value === "string") {
    return <p className={styles.paragraph}>{value}</p>;
  }
  return (
    <div className={styles.body}>
      <PortableText
        value={value}
        components={portableComponents(imageAlt)}
      />
    </div>
  );
}
