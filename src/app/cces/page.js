import ProposalGenerator from "@/components/proposal-generator/proposal-generator";
import { loadProposalData } from "@/lib/proposalData";

export const metadata = {
  title: {
    absolute: "Propuesta Privada",
  },
  description:
    "Generador interno de propuestas en español para alquiler exclusivo de Villas Blessed House.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 60;

export default async function CcesPage() {
  const { activities, phones } = await loadProposalData();
  return <ProposalGenerator locale="es" activities={activities} phones={phones} />;
}
