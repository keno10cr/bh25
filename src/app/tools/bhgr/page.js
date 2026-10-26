import GroupQuoteTool from "@/components/group-quote/group-quote-tool";
import { loadGroupQuoteData } from "@/lib/groupQuoteData";

export const metadata = { title: "BHGR group quote" };

export const dynamic = "force-dynamic";

export default async function ToolsBhgrPage() {
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
