import {
  getContactPageSettings,
  getFooterSettings,
  getGroupsPromo,
} from "@/lib/sanity/content";
import ContactClient from "./contact-client";

export const revalidate = 60;

export const metadata = {
  title: "Contact and Bookings",
  description:
    "Contact Blessed House Villas in Puerto Viejo, Costa Rica. Ask about availability, group stays, and directions by WhatsApp, phone, or email.",
  alternates: { canonical: "/contact" },
};

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
