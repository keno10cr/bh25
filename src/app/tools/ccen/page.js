import ProposalGenerator from "@/components/proposal-generator/proposal-generator";
import { loadProposalData } from "@/lib/proposalData";

export const metadata = { title: "CCEN English flyer" };

export const revalidate = 60;

export default async function ToolsCcenPage() {
  const { activities, phones } = await loadProposalData();
  return <ProposalGenerator locale="en" activities={activities} phones={phones} />;
}
