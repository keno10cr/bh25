"use server";

import { NextResponse } from "next/server";
import { Resend } from "resend";

const subjectLabels = {
  booking: "Villa Booking",
  activities: "Activity Inquiry",
  general: "General Inquiry",
  feedback: "Feedback",
  other: "Other",
};

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

  const { name, email, phone, subject, message } = payload || {};

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const resend = new Resend(apiKey);

  const subjectText = subjectLabels[subject] || subject;
  const phoneText = phone?.trim() ? phone : "N/A";
  const messageHtml = message.replace(/\n/g, "<br />");

  try {
    await resend.emails.send({
      from: "Blessed House <onboarding@resend.dev>",
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
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phoneText}</p>
          <p><strong>Inquiry Type:</strong> ${subjectText}</p>
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


