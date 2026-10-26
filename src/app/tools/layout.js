import ToolsShell from "@/components/tools/tools-shell";

export const metadata = {
  title: { absolute: "Team tools", template: "%s | Team tools" },
  robots: { index: false, follow: false },
};

export default function ToolsLayout({ children }) {
  return <ToolsShell>{children}</ToolsShell>;
}
