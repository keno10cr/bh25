import PaymentsView from "../payments/payments-view";

export const metadata = {
  title: "Pagos",
  robots: { index: false, follow: false },
};

export default function PShortLinkPage() {
  return <PaymentsView forceLanguage="es" />;
}
