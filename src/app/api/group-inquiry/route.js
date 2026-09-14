import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSanityServerClient } from "@/lib/sanity/client";

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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
    message: [
      `Organization: ${payload.organizationName}`,
      `Attendees: ${payload.attendees}`,
      `Target dates:\n${payload.dateRangesText}`,
    ].join("\n"),
    subject: "Group Estate Buyout",
    meta: [
      `Organization: ${payload.organizationName}`,
      `Attendees: ${payload.attendees}`,
      `Target dates:\n${payload.dateRangesText}`,
    ].join("\n"),
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
    website,
  } = payload || {};

  if (String(website || "").trim().length > 0) {
    return NextResponse.json({ error: "Spam detected." }, { status: 400 });
  }

  const dateRanges = normalizeDateRanges(rawRanges);

  if (!organizationName || !attendees || !contactName || !email) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  if (dateRanges.length === 0) {
    return NextResponse.json(
      { error: "Select at least one date range." },
      { status: 400 }
    );
  }

  const attendeeCount = Number(attendees);
  if (!Number.isFinite(attendeeCount) || attendeeCount < 20 || attendeeCount > 45) {
    return NextResponse.json(
      { error: "Estimated attendees must be between 20 and 45." },
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

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: "Blessed House Villas <noreply@blessedhouse.info>",
      to: [
        "blessedhousecr@gmail.com",
        "kervinbb95@gmail.com",
        "keno10cr@gmail.com",
      ],
      reply_to: email,
      subject: `Group Buyout Inquiry – ${String(organizationName).trim()}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
          <h2 style="color: #0a4c3a;">New group estate inquiry from /pvg</h2>
          <p><strong>Organization:</strong> ${escapeHtml(organizationName)}</p>
          <p><strong>Estimated attendees:</strong> ${escapeHtml(attendees)}</p>
          <p><strong>Target dates:</strong></p>
          <ul>${dateRangesHtml}</ul>
          <hr style="border: none; border-top: 1px solid #e5e5dc; margin: 20px 0;" />
          <p><strong>Contact name:</strong> ${escapeHtml(contactName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        </div>
      `,
      text: `
New group estate inquiry from /pvg

Organization: ${organizationName}
Estimated attendees: ${attendees}
Target dates:
${dateRangesText}

Contact name: ${contactName}
Email: ${email}
      `,
    });

    try {
      await saveGroupSubmission({
        organizationName,
        attendees,
        dateRangesText,
        contactName,
        email,
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
