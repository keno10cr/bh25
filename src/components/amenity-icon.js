export function AmenityIcon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "wifi":
      return (
        <svg {...common}>
          <path d="M5 12.5a10 10 0 0 1 14 0" />
          <path d="M8.5 16a5 5 0 0 1 7 0" />
          <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "kitchen":
      return (
        <svg {...common}>
          <path d="M8 3v8a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
          <path d="M10 13v8" />
          <path d="M16 3v18" />
        </svg>
      );
    case "parking":
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
        </svg>
      );
    case "hotWater":
      return (
        <svg {...common}>
          <path d="M12 3c2.5 3 4 5.2 4 8a4 4 0 1 1-8 0c0-2.8 1.5-5 4-8Z" />
        </svg>
      );
    case "ac":
      return (
        <svg {...common}>
          <path d="M12 4v16" />
          <path d="M5 9h14" />
          <path d="M7 15h10" />
          <path d="M8 9l-2 3" />
          <path d="M16 9l2 3" />
        </svg>
      );
    case "bbqArea":
      return (
        <svg {...common}>
          <path d="M6 10h12l-1 10H7L6 10Z" />
          <path d="M9 10V7a3 3 0 0 1 6 0v3" />
        </svg>
      );
    case "bedrooms":
      return (
        <svg {...common}>
          <path d="M3 11v8" />
          <path d="M21 11v8" />
          <path d="M3 14h18" />
          <path d="M5 11V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
          <path d="M13 11V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "bathrooms":
      return (
        <svg {...common}>
          <path d="M4 12h16v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2Z" />
          <path d="M6 12V6a2 2 0 0 1 2-2h1" />
          <path d="M8 7h2" />
        </svg>
      );
    case "people":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3 19c1.5-3 4-4.5 6-4.5S13.5 16 15 19" />
          <path d="M14 14.5c1.4 0 3 .7 4 2.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2 2" />
        </svg>
      );
  }
}
