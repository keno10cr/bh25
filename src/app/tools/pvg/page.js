import PvgPreview from "@/components/tools/pvg-preview";
import { SITE_URL } from "@/lib/siteMetadata";

export const metadata = { title: "PVG group request page" };

export default function ToolsPvgPage() {
  return (
    <PvgPreview
      links={[
        { id: "en", label: "English", url: `${SITE_URL}/pvg` },
        { id: "es", label: "Español", url: `${SITE_URL}/pvg?lang=es` },
      ]}
    />
  );
}
