import GroupQuoteTool from "@/components/group-quote/group-quote-tool";
import { loadGroupQuoteData } from "@/lib/groupQuoteData";

export const metadata = {
  title: { absolute: "Group Reservations Quote" },
  description: "Internal group and buyout quote generator for Villas Blessed House.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BhgrPage() {
  const { villas, settings, minDate, exchangeRate, contact } =
    await loadGroupQuoteData();
  return (
    <GroupQuoteTool
      villas={villas}
      settings={settings}
      minDate={minDate}
      exchangeRate={exchangeRate}
      contact={contact}
    />
  );
}
