import PaymentsView from "../payments/payments-view";

export const metadata = {
  title: "Payments",
  robots: { index: false, follow: false },
};

export default function PaymentShortLinkPage() {
  return <PaymentsView forceLanguage="en" />;
}
