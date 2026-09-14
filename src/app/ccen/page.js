import ProposalGenerator from "@/components/proposal-generator/proposal-generator";

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

export default function CcenPage() {
  return <ProposalGenerator locale="en" />;
}
