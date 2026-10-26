"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { STUDIO_LINK, TOOL_ITEMS, TOOL_SECTIONS, TOOLS_HOME } from "./tool-list";
import styles from "./tools.module.css";

export default function ToolsShell({ children }) {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/tool-auth", { method: "DELETE" });
    } finally {
      window.location.assign(TOOLS_HOME);
    }
  };

  const linkClass = (href) =>
    `${styles.navLink} ${pathname === href ? styles.navLinkActive : ""}`;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Team tools">
        <Link href={TOOLS_HOME} className={styles.brand}>
          <img src="/blessedhouse_logo25.png" alt="" className={styles.brandLogo} />
          <span>
            <strong>Blessed House</strong>
            <small>Team tools</small>
          </span>
        </Link>

        <nav className={styles.nav}>
          <Link
            href={TOOLS_HOME}
            className={linkClass(TOOLS_HOME)}
            aria-current={pathname === TOOLS_HOME ? "page" : undefined}
          >
            <span className={styles.navName}>Workflow guide</span>
            <span className={styles.navTitle}>Group sales process</span>
          </Link>
          {TOOL_SECTIONS.map((section) => (
            <div key={section.id} className={styles.navSection}>
              <p className={styles.navSectionLabel}>{section.label}</p>
              {TOOL_ITEMS.filter((tool) => tool.section === section.id).map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className={linkClass(tool.href)}
                  aria-current={pathname === tool.href ? "page" : undefined}
                >
                  <span className={styles.navName}>{tool.name}</span>
                  <span className={styles.navTitle}>{tool.title}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <a
            href={STUDIO_LINK.href}
            className={styles.studioLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.navName}>{STUDIO_LINK.name}</span>
            <span className={styles.navTitle}>{STUDIO_LINK.title}</span>
          </a>
          <button
            type="button"
            className={styles.signOut}
            onClick={signOut}
            disabled={signingOut}
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
