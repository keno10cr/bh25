import ProposalGenerator from "@/components/proposal-generator/proposal-generator";
import { loadProposalData } from "@/lib/proposalData";

export const metadata = { title: "CCES Spanish flyer" };

export const revalidate = 3600;

export default async function ToolsCcesPage() {
  const { activities, phones } = await loadProposalData();
  return <ProposalGenerator locale="es" activities={activities} phones={phones} />;
}
