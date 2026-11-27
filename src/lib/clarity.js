let initialized = false;

/**
 * Starts Microsoft Clarity once per browser session.
 * Project ID comes from NEXT_PUBLIC_CLARITY_PROJECT_ID (Clarity → Settings → Overview).
 */
export function initClarity() {
  if (typeof window === "undefined" || initialized) {
    return;
  }

  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  if (!projectId) {
    return;
  }

  initialized = true;

  import("@microsoft/clarity")
    .then((mod) => {
      const Clarity = mod.default || mod;
      Clarity.init(projectId);
    })
    .catch((error) => {
      initialized = false;
      console.error("[clarity] failed to load", error);
    });
}
