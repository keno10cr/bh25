"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import CmsText from "@/components/cms-text";
import { resolveCopy } from "@/lib/cms-field";
import { HOME_FEATURED_ITEMS } from "@/data/page-defaults";
import styles from "./featured-villas.module.css";

export default function FeaturedVillas({ copy, villas = [] }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const title = resolveCopy(copy?.featuredTitle, t("featuredVillas.title"), language);
  const subtitle = resolveCopy(
    copy?.featuredSubtitle,
    t("featuredVillas.subtitle"),
    language
  );
  const learnMore = resolveCopy(
    copy?.featuredLearnMore,
    t("common.learnMore"),
    language
  );
  const viewAll = resolveCopy(
    copy?.featuredCta,
    t("featuredVillas.viewAll"),
    language
  );

  const source = copy?.featuredItems?.length
    ? copy.featuredItems
    : HOME_FEATURED_ITEMS.map((item) => ({
        ...item,
        fromCms: false,
        nameFromCms: false,
        teaserFromCms: false,
      }));

  const cards = source.map((featured) => {
    const cmsVilla = villas.find((villa) => villa.slug === featured.slug);
    return {
      ...featured,
      name: featured.name || cmsVilla?.name,
      image: featured.image || cmsVilla?.image,
      nameFromCms: featured.nameFromCms || Boolean(cmsVilla?.nameFromCms),
    };
  });

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>
            <CmsText fromCms={title.fromCms}>{title.value}</CmsText>
          </h2>
          <p>
            <CmsText fromCms={subtitle.fromCms}>{subtitle.value}</CmsText>
          </p>
        </div>

        <div className={styles.grid}>
          {cards.map((villa) => (
            <div key={villa.slug} className={styles.card}>
              <div className={styles.image}>
                <img src={villa.image || "/placeholder.svg"} alt={villa.name} />
              </div>
              <div className={styles.content}>
                <h3>
                  <CmsText fromCms={villa.nameFromCms}>{villa.name}</CmsText>
                </h3>
                <p>
                  <CmsText fromCms={villa.teaserFromCms}>{villa.teaser}</CmsText>
                </p>
                <div className={styles.footer}>
                  <Link href={`/villas/${villa.slug}`} className={styles.link}>
                    <CmsText fromCms={learnMore.fromCms}>
                      {learnMore.value}
                    </CmsText>{" "}
                    →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.viewAll}>
          <Link href="/villas" className={styles.btnLink}>
            <CmsText fromCms={viewAll.fromCms}>{viewAll.value}</CmsText>
          </Link>
        </div>
      </div>
    </section>
  );
}
