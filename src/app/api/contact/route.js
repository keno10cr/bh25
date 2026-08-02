import { NextResponse } from "next/server";
import { Resend } from "resend";

const subjectLabels = {
  booking: "Villa Booking",
  activities: "Activity Inquiry",
  general: "General Inquiry",
};

const getSpamError = (data) => {
  const name = data.name || "";
  const email = data.email || "";
  const message = data.message || "";
  const website = data.website || "";

  const emailLower = email.toLowerCase().trim();
  if (emailLower.endsWith("@gmail.com")) {
    const parts = emailLower.split("@");
    const local = parts[0] || "";
    const dotCount = (local.match(/\./g) || []).length;
    if (dotCount > 2) {
      return "Spam detected: Too many dots.";
    }
  }

  if (name.length > 10 && !name.includes(" ")) {
    return "Spam detected: Invalid name format.";
  }

  if (message.length > 5 && !message.includes(" ")) {
    return "Spam detected: Invalid message format.";
  }

  const midCaps = (str) => {
    const rest = str.slice(1);
    const match = rest.match(/[A-Z]/g) || [];
    return match.length;
  };

  if (midCaps(name) > 3) {
    return "Spam detected: High entropy string.";
  }

  if (website.trim().length > 0) {
    return "Spam detected.";
  }

  return null;
};

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }

  const {
    name,
    email,
    phone,
    subject,
    message,
    website,
    villaId,
    villaName,
    villaMaxPeople,
    checkIn,
    checkOut,
    activityId,
    activityName,
    activityDate,
  } = payload || {};

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  if (!subjectLabels[subject]) {
    return NextResponse.json(
      { error: "Invalid inquiry type." },
      { status: 400 }
    );
  }

  if (subject === "booking" && !villaId) {
    return NextResponse.json(
      { error: "Please select a villa." },
      { status: 400 }
    );
  }

  if (subject === "activities" && !activityId) {
    return NextResponse.json(
      { error: "Please select an activity." },
      { status: 400 }
    );
  }

  const spamError = getSpamError({ name, email, message, website });
  if (spamError) {
    return NextResponse.json({ error: spamError }, { status: 400 });
  }

  const resend = new Resend(apiKey);

  const subjectText = subjectLabels[subject];
  const phoneText = phone?.trim() ? phone : "N/A";
  const messageHtml = escapeHtml(message).replace(/\n/g, "<br />");

  const detailRows = [];
  const detailText = [];

  if (subject === "booking") {
    detailRows.push(
      `<p><strong>Villa:</strong> ${escapeHtml(villaName || `Villa #${villaId}`)}</p>`
    );
    detailText.push(`Villa: ${villaName || `Villa #${villaId}`}`);
    if (villaMaxPeople) {
      detailRows.push(
        `<p><strong>Max people:</strong> ${escapeHtml(villaMaxPeople)}</p>`
      );
      detailText.push(`Max people: ${villaMaxPeople}`);
    }
    if (checkIn || checkOut) {
      detailRows.push(
        `<p><strong>Possible check-in:</strong> ${escapeHtml(checkIn || "N/A")}</p>`
      );
      detailRows.push(
        `<p><strong>Possible check-out:</strong> ${escapeHtml(checkOut || "N/A")}</p>`
      );
      detailText.push(`Possible check-in: ${checkIn || "N/A"}`);
      detailText.push(`Possible check-out: ${checkOut || "N/A"}`);
    }
  }

  if (subject === "activities") {
    detailRows.push(
      `<p><strong>Activity:</strong> ${escapeHtml(
        activityName || `Activity #${activityId}`
      )}</p>`
    );
    detailText.push(`Activity: ${activityName || `Activity #${activityId}`}`);
    if (activityDate) {
      detailRows.push(
        `<p><strong>Possible date:</strong> ${escapeHtml(activityDate)}</p>`
      );
      detailText.push(`Possible date: ${activityDate}`);
    }
  }

  try {
    await resend.emails.send({
      from: "Blessed House Villas <noreply@blessedhouse.info>",
      to: [
        "blessedhousecr@gmail.com",
        "kervinbb95@gmail.com",
        "keno10cr@gmail.com",
      ],
      reply_to: email,
      subject: `Website Inquiry – ${subjectText}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
          <h2 style="color: #0a4c3a;">New message from Blessed House website</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phoneText)}</p>
          <p><strong>Inquiry Type:</strong> ${subjectText}</p>
          ${detailRows.join("\n")}
          <hr style="border: none; border-top: 1px solid #e5e5dc; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p>${messageHtml}</p>
        </div>
      `,
      text: `
New message from Blessed House website

Name: ${name}
Email: ${email}
Phone: ${phoneText}
Inquiry Type: ${subjectText}
${detailText.length ? detailText.join("\n") + "\n" : ""}
Message:
${message}
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    return NextResponse.json(
      { error: "Failed to send email." },
      { status: 500 }
    );
  }
}
