import ToolAccessGate from "@/components/tool-access-gate";
import { TOOL_PATHS, isToolGateConfigured } from "@/lib/toolAuth";

export const metadata = {
  title: { absolute: "Team access" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ToolAccessPage({ searchParams }) {
  const { next } = await searchParams;
  const target = TOOL_PATHS.includes(next) ? next : "/bhgr";
  return (
    <ToolAccessGate
      next={target}
      language={target === "/cces" ? "es" : "en"}
      configured={isToolGateConfigured()}
    />
  );
}
