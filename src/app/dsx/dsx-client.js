"use client";

import { useState } from "react";
import Link from "next/link";
import PropertyBookingSidebar from "@/components/property-booking-sidebar";
import VillaCard from "@/components/villa-card";
import { STATIC_VILLAS } from "@/data/villas";
import bookingStyles from "@/components/property-booking-sidebar.module.css";
import checkoutStyles from "@/components/checkout.module.css";
import styles from "./dsx.module.css";

const COLORS = [
  { name: "Primary", token: "--color-primary", value: "#0a4c3a" },
  { name: "Primary light", token: "--color-primary-light", value: "#0d6b52" },
  { name: "Accent", token: "--color-accent", value: "#f79d1f" },
  { name: "Success light", token: "--color-success-light", value: "#e7f1eb" },
  { name: "Success text", token: "--color-success-text", value: "#28b430" },
  { name: "Neutral light", token: "--color-neutral-light", value: "#fafaf8" },
  { name: "Neutral dark", token: "--color-neutral-dark", value: "#1a1a18" },
  { name: "Neutral muted", token: "--color-neutral-muted", value: "#667066" },
];

const DEMO_PROPERTY = {
  slug: "villa-8-oso-peresozo",
  name: "Villa #8 Oso peresozo",
  guestsMax: 6,
  petsMax: 0,
  currency: "USD",
  priceMin: 120,
  priceMax: 170,
  minimumNights: 2,
  baseGuestCount: 2,
  extraGuestFeePerNight: 30,
  seasonalPricing: [],
  locationLabel: "Blessed House",
  regionEn: "Costa Rica",
};

const DEMO_VILLA = STATIC_VILLAS.find((villa) => villa.slug === "villa-8-oso-peresozo");

const SECTIONS = [
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "buttons", label: "Buttons" },
  { id: "forms", label: "Forms" },
  { id: "hero", label: "Hero" },
  { id: "booking", label: "Booking sidebar" },
  { id: "calendar", label: "Date modal" },
  { id: "checkout", label: "Checkout" },
  { id: "cards", label: "Cards" },
];

function CalendarPreview() {
  const days = Array.from({ length: 35 }, (_, index) => {
    if (index < 2 || index > 32) return null;
    return index - 1;
  });

  return (
    <div className={bookingStyles.modal} style={{ position: "relative" }}>
      <div className={bookingStyles.modalHeader}>
        <h3>Select dates</h3>
        <button type="button">Close</button>
      </div>
      <div className={bookingStyles.months}>
        <div className={bookingStyles.calendarMonth}>
          <h4>September 2026</h4>
          <div className={bookingStyles.weekdays}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className={bookingStyles.calendarGrid}>
            {days.map((day, index) =>
              day ? (
                <button
                  key={day}
                  type="button"
                  className={[
                    bookingStyles.day,
                    day === 24 || day === 26 ? bookingStyles.dayEdge : "",
                    day > 24 && day < 26 ? bookingStyles.dayInRange : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {day}
                </button>
              ) : (
                <span key={`empty-${index}`} className={bookingStyles.emptyDay} />
              )
            )}
          </div>
        </div>
        <div className={bookingStyles.calendarMonth}>
          <h4>October 2026</h4>
          <div className={bookingStyles.weekdays}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <span key={`oct-${day}`}>{day}</span>
            ))}
          </div>
          <div className={bookingStyles.calendarGrid}>
            {Array.from({ length: 35 }, (_, index) => {
              const day = index >= 3 && index <= 33 ? index - 2 : null;
              return day ? (
                <button key={`oct-${day}`} type="button" className={bookingStyles.day}>
                  {day}
                </button>
              ) : (
                <span key={`oct-empty-${index}`} className={bookingStyles.emptyDay} />
              );
            })}
          </div>
        </div>
      </div>
      <div className={bookingStyles.modalFooter}>
        <button type="button">Previous</button>
        <button type="button" className={bookingStyles.confirmDates}>
          Confirm
        </button>
        <button type="button">Next</button>
      </div>
    </div>
  );
}

function GuestPanelPreview() {
  return (
    <div
      className={bookingStyles.guestPanel}
      style={{ position: "relative", boxShadow: "0 12px 28px rgba(0,0,0,0.12)" }}
    >
      {[
        { label: "Adults", value: 2 },
        { label: "Children", value: 0 },
      ].map((row) => (
        <div key={row.label} className={bookingStyles.guestRow}>
          <span>{row.label}</span>
          <div className={bookingStyles.guestControls}>
            <button type="button">−</button>
            <strong>{row.value}</strong>
            <button type="button">+</button>
          </div>
        </div>
      ))}
      <div className={bookingStyles.guestFooter}>
        <p className={bookingStyles.guestCap}>Up to 2 guests</p>
        <button type="button" className={bookingStyles.guestOk}>
          OK
        </button>
      </div>
    </div>
  );
}

export default function DsxClient() {
  const [checkoutStep, setCheckoutStep] = useState(1);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Blessed House DSX</p>
        <h1 className={styles.title}>Design library</h1>
        <p className={styles.lead}>
          Living reference for tokens, typography, buttons, booking UI, checkout
          steps, and core marketing components used across the site.
        </p>
        <nav className={styles.nav} aria-label="Design library sections">
          {SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.label}
            </a>
          ))}
        </nav>
      </header>

      <section id="colors" className={styles.section}>
        <h2 className={styles.sectionTitle}>Colors</h2>
        <p className={styles.sectionDesc}>
          CSS variables defined in globals.css. Use these instead of hardcoded hex
          values in new UI.
        </p>
        <div className={styles.gridAuto}>
          {COLORS.map((color) => (
            <div key={color.token} className={styles.swatch}>
              <div
                className={styles.swatchColor}
                style={{ background: `var(${color.token}, ${color.value})` }}
              />
              <div className={styles.swatchMeta}>
                <strong>{color.name}</strong>
                <code>{color.token}</code>
                <code>{color.value}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="typography" className={styles.section}>
        <h2 className={styles.sectionTitle}>Typography</h2>
        <p className={styles.sectionDesc}>
          REM is the site font family. Headings use primary green. Body copy uses
          neutral dark or muted gray.
        </p>
        <div className={styles.panel}>
          <div className={styles.typeRow}>
            <p className={styles.typeLabel}>Display large</p>
            <p className={styles.displayLg}>Blessed House Villas</p>
          </div>
          <div className={styles.typeRow}>
            <p className={styles.typeLabel}>Display medium</p>
            <p className={styles.displayMd}>About this property</p>
          </div>
          <div className={styles.typeRow}>
            <p className={styles.typeLabel}>Body large</p>
            <p className={styles.bodyLg}>
              Private jungle villa with porch hammock, shared pool access, and
              room for the whole family near Puerto Viejo.
            </p>
          </div>
          <div className={styles.typeRow}>
            <p className={styles.typeLabel}>Body small / meta</p>
            <p className={styles.bodySm}>
              Select dates to see pricing. Minimum stay 2 nights for online
              Reserve.
            </p>
          </div>
        </div>
      </section>

      <section id="buttons" className={styles.section}>
        <h2 className={styles.sectionTitle}>Buttons</h2>
        <p className={styles.sectionDesc}>
          Primary actions use accent gold on booking cards. Marketing CTAs use
          primary green. Success OK uses light green.
        </p>
        <div className={styles.panel}>
          <div className={styles.buttonRow}>
            <button type="button" className={styles.btnPrimary}>
              Primary
            </button>
            <button type="button" className={styles.btnAccent}>
              Reserve
            </button>
            <button type="button" className={styles.btnGhost}>
              Inquire
            </button>
            <button type="button" className={styles.btnSuccess}>
              OK
            </button>
          </div>
          <div className={`${styles.darkStrip} ${styles.buttonRow}`} style={{ marginTop: "1rem" }}>
            <button type="button" className={styles.btnAccent}>
              Reserve
            </button>
            <button type="button" className={styles.btnSecondary}>
              Inquire
            </button>
          </div>
        </div>
      </section>

      <section id="forms" className={styles.section}>
        <h2 className={styles.sectionTitle}>Form fields</h2>
        <p className={styles.sectionDesc}>
          Checkout and contact forms share uppercase labels, rounded inputs, and
          primary focus rings.
        </p>
        <div className={styles.panel}>
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>First name</span>
              <input className={styles.input} placeholder="Maria" />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Last name</span>
              <input className={styles.input} placeholder="Lopez" />
            </label>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.fieldLabel}>Email</span>
              <input className={styles.input} placeholder="you@example.com" />
            </label>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.fieldLabel}>Mobile phone</span>
              <input className={styles.input} placeholder="+506 8888 8888" />
            </label>
          </div>
        </div>
      </section>

      <section id="hero" className={styles.section}>
        <h2 className={styles.sectionTitle}>Hero</h2>
        <p className={styles.sectionDesc}>
          Homepage hero uses a full width image, accent content card, and primary
          / outline CTAs.
        </p>
        <div className={styles.heroPreview}>
          <img
            src="/BannerVilla4.jpg"
            alt=""
            className={styles.heroImage}
          />
          <div className={styles.heroCard}>
            <h3>Blessed House</h3>
            <p>
              Caribbean style villas near Puerto Viejo with jungle views, shared
              pool, and easy access to the coast.
            </p>
            <div className={styles.buttonRow}>
              <Link href="/villas" className={styles.btnPrimary}>
                View villas
              </Link>
              <Link href="/contact" className={styles.btnGhost}>
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="booking" className={styles.section}>
        <h2 className={styles.sectionTitle}>Booking sidebar</h2>
        <p className={styles.sectionDesc}>
          Live property sidebar with availability, guest picker, quote breakdown,
          Reserve, and Inquire.
        </p>
        <div className={styles.grid2}>
          <div className={styles.bookingWrap}>
            <PropertyBookingSidebar
              property={DEMO_PROPERTY}
              reviews={[
                { id: "1", rating: 5, guestName: "Guest", comment: "Lovely stay" },
              ]}
              villaNumericId={8}
            />
          </div>
          <div>
            <div className={styles.panel}>
              <h3 className={styles.displayMd} style={{ fontSize: "1.1rem" }}>
                Guest picker
              </h3>
              <p className={styles.bodySm} style={{ marginBottom: "1rem" }}>
                OK closes the panel. Light green matches{" "}
                <code>--color-success-light</code>.
              </p>
              <GuestPanelPreview />
            </div>
          </div>
        </div>
      </section>

      <section id="calendar" className={styles.section}>
        <h2 className={styles.sectionTitle}>Date selection modal</h2>
        <p className={styles.sectionDesc}>
          Dual month calendar used on property pages. Range nights use light
          green fill. Check in and check out use primary green circles.
        </p>
        <div className={styles.modalDemo}>
          <div className={styles.inlineModal}>
            <CalendarPreview />
          </div>
        </div>
      </section>

      <section id="checkout" className={styles.section}>
        <h2 className={styles.sectionTitle}>Checkout flow</h2>
        <p className={styles.sectionDesc}>
          Three step shell: contact info, house rules, then mock payment. Tax and
          service fee come from Sanity System Settings.
        </p>
        <div className={styles.buttonRow} style={{ marginBottom: "1rem" }}>
          {[1, 2, 3].map((step) => (
            <button
              key={step}
              type="button"
              className={step === checkoutStep ? styles.btnAccent : styles.btnGhost}
              onClick={() => setCheckoutStep(step)}
            >
              Step {step}
            </button>
          ))}
        </div>
        <div className={checkoutStyles.pageShell} style={{ padding: "1.25rem", minHeight: "auto" }}>
          <div className={checkoutStyles.layout}>
            <main className={checkoutStyles.mainColumn}>
              <section className={checkoutStyles.panel}>
                {checkoutStep === 1 ? (
                  <>
                    <div className={checkoutStyles.panelHeader}>
                      <div className={checkoutStyles.panelIcon}>1</div>
                      <div>
                        <h3 className={checkoutStyles.panelTitle}>Guest information</h3>
                        <p className={checkoutStyles.panelSubtitle}>
                          Required before we confirm your stay.
                        </p>
                      </div>
                    </div>
                    <div className={styles.fieldGrid}>
                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>First name</span>
                        <input className={styles.input} defaultValue="Maria" />
                      </label>
                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>Last name</span>
                        <input className={styles.input} defaultValue="Lopez" />
                      </label>
                    </div>
                  </>
                ) : null}
                {checkoutStep === 2 ? (
                  <>
                    <div className={checkoutStyles.panelHeader}>
                      <div className={checkoutStyles.panelIcon}>2</div>
                      <div>
                        <h3 className={checkoutStyles.panelTitle}>House rules</h3>
                        <p className={checkoutStyles.panelSubtitle}>
                          Pulled from the property document in Sanity.
                        </p>
                      </div>
                    </div>
                    <div className={checkoutStyles.ruleCard}>
                      <h4 className={checkoutStyles.ruleTitle}>Shared pool area</h4>
                      <p className={styles.bodySm}>
                        Rinse off sand before swimming. Quiet use after 10 pm.
                      </p>
                    </div>
                  </>
                ) : null}
                {checkoutStep === 3 ? (
                  <>
                    <div className={checkoutStyles.panelHeader}>
                      <div className={checkoutStyles.panelIcon}>3</div>
                      <div>
                        <h3 className={checkoutStyles.panelTitle}>Payment</h3>
                        <p className={checkoutStyles.panelSubtitle}>
                          Secure mock payment step for this prototype.
                        </p>
                      </div>
                    </div>
                    <div className={checkoutStyles.segmentedControl}>
                      <button type="button" className={`${checkoutStyles.segmentButton} ${checkoutStyles.segmentButtonActive}`}>
                        Pay now
                      </button>
                      <button type="button" className={checkoutStyles.segmentButton}>
                        Pay later
                      </button>
                    </div>
                  </>
                ) : null}
                <button type="button" className={checkoutStyles.primaryButton} style={{ marginTop: "1rem" }}>
                  Continue
                </button>
              </section>
            </main>
            <aside className={checkoutStyles.sidebarColumn}>
              <div className={checkoutStyles.sidebarCard}>
                <div className={checkoutStyles.propertyRow}>
                  <div className={checkoutStyles.propertyCopy}>
                    <h4 className={checkoutStyles.propertyTitle}>Villa #8 Oso peresozo</h4>
                    <p className={checkoutStyles.propertyLocation}>Blessed House, Costa Rica</p>
                  </div>
                </div>
                <div className={checkoutStyles.summaryGrid}>
                  <div>
                    <span className={checkoutStyles.summaryLabel}>Check in</span>
                    <strong>Thu, Sep 24, 2026</strong>
                  </div>
                  <div>
                    <span className={checkoutStyles.summaryLabel}>Check out</span>
                    <strong>Sat, Sep 26, 2026</strong>
                  </div>
                  <div className={checkoutStyles.summaryFull}>
                    <span className={checkoutStyles.summaryLabel}>Guests</span>
                    <strong>2 Adults</strong>
                  </div>
                </div>
                <div className={checkoutStyles.priceCard}>
                  <h4 className={checkoutStyles.priceTitle}>Price summary</h4>
                  <div className={checkoutStyles.priceLine}>
                    <span>Stay subtotal (2 nights)</span>
                    <span>$290.00</span>
                  </div>
                  <div className={checkoutStyles.priceLine}>
                    <span>Cleaning fee (9%)</span>
                    <span>$26.10</span>
                  </div>
                  <div className={checkoutStyles.priceLine}>
                    <span>Tax (13%)</span>
                    <span>$41.09</span>
                  </div>
                  <div className={`${checkoutStyles.priceLine} ${checkoutStyles.priceTotal}`}>
                    <span>Total</span>
                    <strong>$357.19</strong>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
        <p className={styles.note}>
          Live checkout:{" "}
          <Link href="/checkout?property=villa-8-oso-peresozo&checkIn=2026-09-24&checkOut=2026-09-26&adults=2">
            open full flow
          </Link>
        </p>
      </section>

      <section id="cards" className={styles.section}>
        <h2 className={styles.sectionTitle}>Villa card</h2>
        <p className={styles.sectionDesc}>
          Listing card used on the villas page. Book now routes to the native
          property detail booking sidebar.
        </p>
        <div className={styles.cardGrid}>
          {DEMO_VILLA ? <VillaCard villa={DEMO_VILLA} /> : null}
        </div>
      </section>
    </div>
  );
}
