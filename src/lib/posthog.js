const AIRBNB_PROFILE_URL = "https://www.airbnb.com/users/show/549621434";

let posthogClient = null;
let initialized = false;
let initPromise = null;

export { AIRBNB_PROFILE_URL };

async function loadPostHogClient() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!posthogClient) {
    const { default: posthog } = await import("posthog-js");
    posthogClient = posthog;
  }

  return posthogClient;
}

export function initPostHog() {
  if (typeof window === "undefined" || initialized) {
    return initPromise;
  }

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    return null;
  }

  initPromise = loadPostHogClient().then((posthog) => {
    if (!posthog || initialized) {
      return posthog;
    }

    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
    });

    initialized = true;
    return posthog;
  });

  return initPromise;
}

export function isPostHogReady() {
  return (
    typeof window !== "undefined" &&
    initialized &&
    posthogClient &&
    typeof posthogClient.capture === "function"
  );
}

export function capturePostHogEvent(eventName, properties = {}) {
  if (typeof window === "undefined") {
    return;
  }

  initPostHog()?.then((posthog) => {
    if (posthog && typeof posthog.capture === "function") {
      posthog.capture(eventName, properties);
    }
  });
}

export function trackVillaCardExpanded({
  villa_id,
  villa_name,
  current_language,
}) {
  capturePostHogEvent("villa_card_expanded", {
    villa_id,
    villa_name,
    current_language,
  });
}

export function trackAirbnbRedirectClicked({
  villa_id = null,
  villa_name = null,
  destination_url = AIRBNB_PROFILE_URL,
}) {
  capturePostHogEvent("airbnb_redirect_clicked", {
    villa_id,
    villa_name,
    destination_url,
  });
}

export function trackContactFormSubmitted({ form_subject, input_language }) {
  capturePostHogEvent("contact_form_submitted", {
    form_subject,
    input_language,
  });
}

export function trackLanguageSwitched({ previous_language, new_language }) {
  capturePostHogEvent("language_switched", {
    previous_language,
    new_language,
  });
}

export async function capturePostHogPageview(url) {
  const posthog = await initPostHog();
  if (posthog && typeof posthog.capture === "function") {
    posthog.capture("$pageview", { $current_url: url });
  }
}
