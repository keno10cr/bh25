import { getContactPageSettings, getFooterSettings } from "@/lib/sanity/content";
import ContactClient from "./contact-client";

export const revalidate = 60;

export default async function ContactPage() {
  const [copy, footer] = await Promise.all([
    getContactPageSettings(),
    getFooterSettings(),
  ]);
  return <ContactClient copy={copy} footer={footer} />;
}
