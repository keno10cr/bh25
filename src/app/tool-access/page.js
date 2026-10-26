import ToolAccessGate from "@/components/tool-access-gate";
import { isToolGateConfigured, isToolPath } from "@/lib/toolAuth";

export const metadata = {
  title: { absolute: "Team access" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ToolAccessPage({ searchParams }) {
  const { next } = await searchParams;
  const target = isToolPath(next) ? next : "/tools";
  const spanish = target === "/cces" || target === "/tools/cces";
  return (
    <ToolAccessGate
      next={target}
      language={spanish ? "es" : "en"}
      configured={isToolGateConfigured()}
    />
  );
}
