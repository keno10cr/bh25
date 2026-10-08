import PaymentsView from "./payments-view";

export const metadata = {
  title: "Payments",
  robots: { index: false, follow: false },
};

export default function PaymentsPage() {
  return <PaymentsView />;
}
