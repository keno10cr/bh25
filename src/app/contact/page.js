import { getContactPageSettings } from "@/lib/sanity/content";
import ContactClient from "./contact-client";

export const revalidate = 60;

export default async function ContactPage() {
  const copy = await getContactPageSettings();
  return <ContactClient copy={copy} />;
}
