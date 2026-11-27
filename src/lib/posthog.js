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

/** Homepage location section: guest copied the Maps address. */
export function trackAddressCopied({ address, current_language }) {
  capturePostHogEvent("address_copied", {
    address,
    current_language,
  });
}

/** Villa page: guest opened the photo gallery lightbox. */
export function trackVillaGalleryOpened({
  villa_id = null,
  villa_slug = null,
  villa_name = null,
  image_index = 0,
}) {
  capturePostHogEvent("villa_gallery_opened", {
    villa_id,
    villa_slug,
    villa_name,
    image_index,
  });
}

/** Site gallery page: guest opened a photo. */
export function trackGalleryImageOpened({
  image_index,
  image_label = null,
  image_key = null,
}) {
  capturePostHogEvent("gallery_image_opened", {
    image_index,
    image_label,
    image_key,
  });
}

/** Villa booking sidebar: guest clicked Request Booking → checkout. */
export function trackBookingRequestClicked({
  villa_id = null,
  villa_slug = null,
  villa_name = null,
  check_in = null,
  check_out = null,
  nights = null,
  guests = null,
  currency = null,
}) {
  capturePostHogEvent("booking_request_clicked", {
    villa_id,
    villa_slug,
    villa_name,
    check_in,
    check_out,
    nights,
    guests,
    currency,
  });
}

/** Checkout wizard step (1 = guest info, 2 = review / submit). */
export function trackCheckoutStepViewed({
  step,
  villa_id = null,
  villa_slug = null,
  villa_name = null,
  check_in = null,
  check_out = null,
  nights = null,
}) {
  capturePostHogEvent("checkout_step_viewed", {
    step,
    villa_id,
    villa_slug,
    villa_name,
    check_in,
    check_out,
    nights,
  });
}

/** Checkout: booking request successfully sent to the host. */
export function trackBookingRequestSubmitted({
  villa_id = null,
  villa_slug = null,
  villa_name = null,
  check_in = null,
  check_out = null,
  nights = null,
  total = null,
  currency = null,
}) {
  capturePostHogEvent("booking_request_submitted", {
    villa_id,
    villa_slug,
    villa_name,
    check_in,
    check_out,
    nights,
    total,
    currency,
  });
}

export async function capturePostHogPageview(url) {
  const posthog = await initPostHog();
  if (posthog && typeof posthog.capture === "function") {
    posthog.capture("$pageview", { $current_url: url });
  }
}
