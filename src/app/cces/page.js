import ProposalGenerator from "@/components/proposal-generator/proposal-generator";

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

export default function CcesPage() {
  return <ProposalGenerator locale="es" />;
}
