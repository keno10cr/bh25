import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  buildGroupInquiryEmail,
  groupPhoneIssue,
  preferredLanguageCode,
} from "@/lib/group-inquiry";
import { createSanityServerClient } from "@/lib/sanity/client";

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const ATTENDEE_RANGES = {
  "20-29": "20 to 29 guests",
  "30-39": "30 to 39 guests",
  "40-45": "40 to 45 guests",
};

function normalizeDateRanges(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((range) => ({
      checkIn: String(range?.checkIn || "").trim(),
      checkOut: String(range?.checkOut || "").trim(),
    }))
    .filter((range) => range.checkIn && range.checkOut)
    .slice(0, 3);
}

function formatRangesText(ranges) {
  return ranges
    .map((range, index) => `Option ${index + 1}: ${range.checkIn} to ${range.checkOut}`)
    .join("\n");
}

async function saveGroupSubmission(payload) {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.warn("SANITY_API_WRITE_TOKEN missing; group inquiry not stored.");
    return;
  }

  const client = createSanityServerClient();
  await client.create({
    _type: "formSubmission",
    formType: "groupInquiry",
    status: "needsReview",
    submittedAt: new Date().toISOString(),
    name: String(payload.contactName || "").trim(),
    email: String(payload.email || "").trim(),
    phone: String(payload.phone || "").trim(),
    language: payload.languageCode,
    message: payload.details,
    subject: "Group Estate Buyout",
    meta: payload.details,
  });
}

export async function POST(request) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("Missing RESEND_API_KEY environment variable.");
    return NextResponse.json(
      { error: "Email service not configured." },
      { status: 500 }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }

  const {
    organizationName,
    attendees,
    dateRanges: rawRanges,
    contactName,
    email,
    phone,
    notes,
    language,
    website,
  } = payload || {};

  if (String(website || "").trim().length > 0) {
    return NextResponse.json({ error: "Spam detected." }, { status: 400 });
  }

  const dateRanges = normalizeDateRanges(rawRanges);

  const phoneIssue = groupPhoneIssue(phone);
  if (!organizationName || !attendees || !contactName || !email || phoneIssue === "required") {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  if (phoneIssue === "invalid") {
    return NextResponse.json(
      { error: "Enter a valid phone number." },
      { status: 400 }
    );
  }

  const groupNotes = String(notes || "").trim();
  if (groupNotes.length > 2000) {
    return NextResponse.json(
      { error: "Group notes are too long." },
      { status: 400 }
    );
  }

  if (dateRanges.length === 0) {
    return NextResponse.json(
      { error: "Select at least one date range." },
      { status: 400 }
    );
  }

  const attendeeLabel = ATTENDEE_RANGES[String(attendees).trim()];
  if (!attendeeLabel) {
    return NextResponse.json(
      { error: "Choose an attendee range between 20 and 45." },
      { status: 400 }
    );
  }

  const dateRangesText = formatRangesText(dateRanges);
  const dateRangesHtml = dateRanges
    .map(
      (range, index) =>
        `<li>Option ${index + 1}: ${escapeHtml(range.checkIn)} to ${escapeHtml(range.checkOut)}</li>`
    )
    .join("");

  const languageCode = preferredLanguageCode(language);
  const inquiryEmail = buildGroupInquiryEmail({
    organizationName,
    attendeeLabel,
    dateRangesHtml,
    dateRangesText,
    contactName,
    email,
    phone: String(phone).trim(),
    language: languageCode,
    notes: groupNotes,
  });
  const details = [
    `Group / Organization: ${organizationName}`,
    `Attendees: ${attendeeLabel}`,
    `Target dates:\n${dateRangesText}`,
    `Phone / WhatsApp: ${String(phone).trim()}`,
    `Preferred Language: ${inquiryEmail.languageLabel}`,
    groupNotes ? `Group Notes:\n${groupNotes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: "Blessed House Villas <noreply@blessedhouse.info>",
      to: [
        "contact@blessedhouse.info",
        "kervinbb95@gmail.com",
        "keno10cr@gmail.com",
      ],
      reply_to: email,
      subject: `Group Buyout Inquiry: ${String(organizationName).trim()}`,
      html: inquiryEmail.html,
      text: inquiryEmail.text,
    });

    try {
      await saveGroupSubmission({
        contactName,
        email,
        phone: String(phone).trim(),
        languageCode,
        details,
      });
    } catch (storeError) {
      console.error("Group inquiry email sent but Sanity store failed:", storeError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error sending group inquiry via Resend:", error);
    return NextResponse.json(
      { error: "Failed to send email." },
      { status: 500 }
    );
  }
}
