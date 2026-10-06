import {
  getContactPageSettings,
  getFooterSettings,
  getGroupsPromo,
} from "@/lib/sanity/content";
import ContactClient from "./contact-client";

export const revalidate = 60;

export default async function ContactPage() {
  const [copy, footer, groupsPromo] = await Promise.all([
    getContactPageSettings(),
    getFooterSettings(),
    getGroupsPromo(),
  ]);
  return (
    <ContactClient copy={copy} footer={footer} groupsPromo={groupsPromo} />
  );
}
