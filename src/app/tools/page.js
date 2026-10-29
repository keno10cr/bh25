import Link from "next/link";
import EmailNote from "@/components/tools/email-note";
import { STUDIO_LINK, TOOL_ITEMS } from "@/components/tools/tool-list";
import styles from "@/components/tools/tools.module.css";

export const metadata = {
  title: { absolute: "Team tools" },
  robots: { index: false, follow: false },
};

const LEAD_LIST = "Company Connections (Churches Sep 2026)";
const OUTREACH_EMAIL = "contact@blessedhouse.info";
const INVITE_EMAIL =
  "Hello, we are contacting you because we want to invite you to our beautiful lush green paradise in the Caribbean coast of Costa Rica, where you will find out what Pura Vida really means and will get to enjoy nature in our villas. For us it would be an honor to host your family or group of friends; this was the intention of this place and we want to welcome you.";

const EMAIL_SAMPLES = [
  { label: "Churches", text: INVITE_EMAIL },
  { label: "Private companies", text: INVITE_EMAIL },
  { label: "Sports clubs", text: INVITE_EMAIL },
];

const STEPS = [
  {
    title: "Send the invitation",
    body: (
      <>
        Email each group from <strong>{OUTREACH_EMAIL}</strong> through our Gmail
        account. Keep it warm and short, attach the PDF flyer from{" "}
        <Link href="/tools/ccen">CCEN</Link> (English) or{" "}
        <Link href="/tools/cces">CCES</Link> (Spanish), and include the{" "}
        <Link href="/tools/pvg">PVG</Link> link so they can pitch their preferred
        date ranges.
      </>
    ),
    emails: EMAIL_SAMPLES,
  },
  {
    title: "Track and follow up",
    body: (
      <>
        Log every send in the Excel sheet: who was contacted, the date, and the
        status. If there is no reply after 2 weeks, send one friendly follow up
        and note it in the sheet.
      </>
    ),
  },
  {
    title: "Quote when they reply",
    body: (
      <>
        Open <Link href="/tools/bhgr">BHGR</Link> to check live availability
        against Airbnb blocks, offer alternative dates or villa mixes if needed,
        and send the precise priced proposal as a PDF.
      </>
    ),
  },
];

export default function ToolsHomePage() {
  return (
    <div className={styles.home}>
      <header className={styles.homeHeader}>
        <p className={styles.eyebrow}>Blessed House team</p>
        <h1>Workflow &amp; Strategy Guide</h1>
        <p className={styles.lead}>
          Our outbound group sales process, from first email to a priced proposal.
        </p>
      </header>

      <section className={styles.goal}>
        <h2>Goal</h2>
        <p>
          Reach out to groups in and around Puerto Viejo: churches, private
          companies, and sports clubs such as tennis and football. Work from our
          lead list in Google Drive, <strong>{LEAD_LIST}</strong>.
        </p>
      </section>

      <ol className={styles.steps}>
        {STEPS.map((step, index) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.stepNumber}>Step {index + 1}</span>
            <h3>{step.title}</h3>
            <div className={styles.stepBody}>
              <p>{step.body}</p>
              {step.emails ? (
                <div className={styles.emailNotes}>
                  <p className={styles.emailNotesLead}>
                    Sample emails you can copy into Gmail. The wording is the same
                    for churches, companies, and sports clubs.
                  </p>
                  {step.emails.map((email) => (
                    <EmailNote
                      key={email.label}
                      label={email.label}
                      text={email.text}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <section className={styles.studioCard}>
        <div>
          <h2>{STUDIO_LINK.name}</h2>
          <p>
            Days you block in the Sanity calendar, plus paid website bookings, are
            sent to Airbnb through our own iCal sync. Airbnb reads that calendar on
            its own schedule, usually every few hours, so a new block is not
            instant. Airbnb bookings come back into Sanity about every 20 minutes
            and close those days on the website, in BHGR, and on PVG.
          </p>
          <p className={styles.muted}>
            We only list on Airbnb right now. VRBO and Booking.com are not
            connected.
          </p>
        </div>
        <a
          href={STUDIO_LINK.href}
          className={styles.primaryButton}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open BH Studio
        </a>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Tools</h2>
        <div className={styles.toolGrid}>
          {TOOL_ITEMS.map((tool) => (
            <article key={tool.id} className={styles.toolCard}>
              <p className={styles.toolName}>{tool.name}</p>
              <h3>{tool.title}</h3>
              <p>{tool.summary}</p>
              <div className={styles.toolActions}>
                <Link href={tool.href} className={styles.primaryButton}>
                  Open
                </Link>
                {tool.standalone ? (
                  <a
                    href={tool.standalone}
                    className={styles.ghostButton}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tool.standalone}
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
