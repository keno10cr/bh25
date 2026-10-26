import ProposalGenerator from "@/components/proposal-generator/proposal-generator";
import { loadProposalData } from "@/lib/proposalData";

export const metadata = {
  title: {
    absolute: "Private Proposal",
  },
  description:
    "Internal English proposal generator for private estate buyouts at Villas Blessed House.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 60;

export default async function CcenPage() {
  const { activities, phones } = await loadProposalData();
  return <ProposalGenerator locale="en" activities={activities} phones={phones} />;
}
