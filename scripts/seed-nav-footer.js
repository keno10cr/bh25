/**
 * Seed Navigation + Footer singletons in Sanity.
 * Usage: node --env-file=.env.local scripts/seed-nav-footer.js
 */
import { createClient } from "@sanity/client";
import {
  FOOTER_SETTINGS_DEFAULTS,
  NAV_SETTINGS_DEFAULTS,
} from "../src/data/page-defaults.js";
import { sanityApiVersion, sanityDataset, sanityProjectId } from "../sanity/env.js";

async function getClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (token) {
    return createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      token,
      useCdn: false,
    });
  }

  const { getCliClient } = await import("sanity/cli");
  return getCliClient({ apiVersion: sanityApiVersion });
}

async function main() {
  const client = await getClient();

  // Prefer phones already saved on Contact if present.
  const contact = await client.fetch(
    `*[_id == "contactPageSettings"][0]{ phones[]{ label, tel } }`
  );
  const contactPhones = Array.isArray(contact?.phones)
    ? contact.phones
        .map((phone, index) => {
          const label = String(phone?.label || "").trim();
          const tel = String(phone?.tel || "").replace(/[^\d+]/g, "").trim();
          if (!label || !tel) return null;
          return {
            _key: `phone${index + 1}`,
            label,
            tel: tel.startsWith("+") ? tel : `+${tel}`,
          };
        })
        .filter(Boolean)
    : [];

  const phones =
    contactPhones.length > 0
      ? contactPhones
      : FOOTER_SETTINGS_DEFAULTS.phones;

  await client.createOrReplace({
    _id: "navSettings",
    _type: "navSettings",
    ...NAV_SETTINGS_DEFAULTS,
  });

  await client.createOrReplace({
    _id: "footerSettings",
    _type: "footerSettings",
    ...FOOTER_SETTINGS_DEFAULTS,
    phones,
  });

  // Drop phones from Contact page now that Footer owns them.
  if (contactPhones.length > 0) {
    await client.patch("contactPageSettings").unset(["phones"]).commit();
  }

  console.log("Seeded navSettings and footerSettings.");
  console.log(
    `Phones (${phones.length}):`,
    phones.map((p) => p.label).join(" | ")
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
