const PHONE_CHARS = /^[0-9+\-() ]+$/;

const LANGUAGE_LABELS = {
  en: "English (EN)",
  es: "Spanish (ES)",
  de: "German (DE)",
  nl: "Dutch (NL)",
  fr: "French (FR)",
  ja: "Japanese (JA)",
  pt: "Portuguese (PT)",
  ar: "Arabic (AR)",
};

export function groupPhoneIssue(value) {
  const phone = String(value ?? "").trim();
  if (!phone) return "required";
  if (!PHONE_CHARS.test(phone) || !/\d/.test(phone)) return "invalid";
  return "";
}

export function preferredLanguageCode(code) {
  const key = String(code || "").trim().toLowerCase();
  return LANGUAGE_LABELS[key] ? key : "en";
}

export function preferredLanguageLabel(code) {
  return LANGUAGE_LABELS[preferredLanguageCode(code)];
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildGroupInquiryEmail({
  organizationName,
  attendeeLabel,
  dateRangesHtml,
  dateRangesText,
  contactName,
  email,
  phone,
  language,
  notes,
}) {
  const languageLabel = preferredLanguageLabel(language);
  const notesText = String(notes || "").trim();
  const notesHtml = notesText
    ? `<p><strong>Group Notes:</strong><br>${escapeHtml(notesText).replace(/\n/g, "<br>")}</p>`
    : "";
  const notesPlain = notesText ? `\nGroup Notes:\n${notesText}` : "";

  const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
          <h2 style="color: #0a4c3a;">New group estate inquiry from /pvg</h2>
          <p><strong>Group / Organization:</strong> ${escapeHtml(organizationName)}</p>
          <p><strong>Estimated attendees:</strong> ${escapeHtml(attendeeLabel)}</p>
          <p><strong>Target dates:</strong></p>
          <ul>${dateRangesHtml}</ul>
          <hr style="border: none; border-top: 1px solid #e5e5dc; margin: 20px 0;" />
          <p><strong>Contact name:</strong> ${escapeHtml(contactName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone / WhatsApp:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Preferred Language:</strong> ${escapeHtml(languageLabel)}</p>
          ${notesHtml}
        </div>
      `;

  const text = `
New group estate inquiry from /pvg

Group / Organization: ${organizationName}
Estimated attendees: ${attendeeLabel}
Target dates:
${dateRangesText}

Contact name: ${contactName}
Email: ${email}
Phone / WhatsApp: ${phone}
Preferred Language: ${languageLabel}${notesPlain}
      `;

  return { html, text, languageLabel };
}
