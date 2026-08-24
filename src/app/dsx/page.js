import DsxClient from "./dsx-client";

export const metadata = {
  title: "DSX | Blessed House",
  description: "Internal component and token reference for Blessed House.",
  robots: { index: false, follow: false },
};

export default function DsxPage() {
  return <DsxClient />;
}
