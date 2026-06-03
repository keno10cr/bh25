import posthog from "posthog-js";

const AIRBNB_PROFILE_URL = "https://www.airbnb.com/users/show/549621434";

let initialized = false;

export { AIRBNB_PROFILE_URL };

export function initPostHog() {
  if (typeof window === "undefined" || initialized) {
    return;
  }

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    return;
  }

  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
  });

  initialized = true;
}

export function isPostHogReady() {
  return (
    typeof window !== "undefined" &&
    initialized &&
    typeof posthog.capture === "function"
  );
}

export function capturePostHogEvent(eventName, properties = {}) {
  if (!isPostHogReady()) {
    return;
  }

  posthog.capture(eventName, properties);
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
