"use client";

export default function CmsText({ fromCms, children, as: Tag = "span" }) {
  if (fromCms || children == null || children === "") {
    return children;
  }

  return <Tag className="cms-fallback">{children}</Tag>;
}
