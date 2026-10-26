export const TOOLS_HOME = "/tools";

export const TOOL_SECTIONS = [
  { id: "groups", label: "Group sales" },
  { id: "social", label: "Social Media" },
];

export const TOOL_ITEMS = [
  {
    id: "ccen",
    section: "groups",
    href: "/tools/ccen",
    standalone: "/ccen",
    name: "CCEN",
    title: "English group flyer",
    summary: "PDF brochure to attach to the first email for English speaking groups.",
  },
  {
    id: "cces",
    section: "groups",
    href: "/tools/cces",
    standalone: "/cces",
    name: "CCES",
    title: "Spanish group flyer",
    summary: "The same PDF brochure in Spanish for Spanish speaking groups.",
  },
  {
    id: "bhgr",
    section: "groups",
    href: "/tools/bhgr",
    standalone: "/bhgr",
    name: "BHGR",
    title: "Group quote builder",
    summary: "Live availability against Airbnb blocks, villa mix, pricing and the quote PDF.",
  },
  {
    id: "pvg",
    section: "groups",
    href: "/tools/pvg",
    standalone: "/pvg",
    name: "PVG",
    title: "Public group request page",
    summary: "The page groups open from the email to send their preferred date ranges.",
  },
  {
    id: "social",
    section: "social",
    href: "/tools/social",
    name: "Image Checker",
    title: "Test images before sharing",
    summary:
      "Checks a blog post's social images against the rules of every platform before we share it.",
  },
];

export const STUDIO_LINK = {
  href: "/admin",
  name: "BH Studio",
  title: "Sanity content and calendar",
};
