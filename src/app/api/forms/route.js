import { NextResponse } from "next/server";
import {
  COMMENT_MAX_LENGTH,
  COMMENT_MIN_LENGTH,
  getCommentLengthCode,
  isGuestCommentForm,
} from "@/lib/comment-length";
import { createSanityServerClient } from "@/lib/sanity/client";

const ALLOWED_TYPES = new Set([
  "guestExperience",
  "villaComment",
  "contact",
]);

function getSpamError(data) {
  const name = data.name || "";
  const email = data.email || "";
  const message = data.message || "";
  const website = data.website || "";

  const emailLower = email.toLowerCase().trim();
  if (emailLower.endsWith("@gmail.com")) {
    const local = emailLower.split("@")[0] || "";
    const dotCount = (local.match(/\./g) || []).length;
    if (dotCount > 2) return "Spam detected.";
  }

  if (name.length > 10 && !name.includes(" ")) {
    return "Spam detected.";
  }

  if (message.length > 5 && !message.includes(" ")) {
    return "Spam detected.";
  }

  if (website.trim().length > 0) {
    return "Spam detected.";
  }

  return null;
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const {
    formType,
    name,
    email,
    phone,
    rating,
    message,
    villaId,
    subject,
    meta,
    language,
    website,
  } = payload || {};

  if (!ALLOWED_TYPES.has(formType)) {
    return NextResponse.json({ error: "Invalid form type." }, { status: 400 });
  }

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (isGuestCommentForm(formType)) {
    const lengthCode = getCommentLengthCode(message);
    if (lengthCode === "tooShort") {
      return NextResponse.json(
        {
          error: `Please write at least ${COMMENT_MIN_LENGTH} characters.`,
          code: lengthCode,
        },
        { status: 400 }
      );
    }
    if (lengthCode === "tooLong") {
      return NextResponse.json(
        {
          error: `Please keep comments to ${COMMENT_MAX_LENGTH} characters or fewer.`,
          code: lengthCode,
        },
        { status: 400 }
      );
    }
  }

  if (formType === "villaComment" && !villaId) {
    return NextResponse.json({ error: "Please select a villa." }, { status: 400 });
  }

  if (formType === "contact" && !subject) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const spamError = getSpamError({ name, email, message, website });
  if (spamError) {
    return NextResponse.json({ error: spamError }, { status: 400 });
  }

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("Missing SANITY_API_WRITE_TOKEN");
    return NextResponse.json(
      { error: "Form service not configured." },
      { status: 500 }
    );
  }

  try {
    const client = createSanityServerClient();
    const doc = {
      _type: "formSubmission",
      formType,
      status: "needsReview",
      submittedAt: new Date().toISOString(),
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : undefined,
      rating: rating ? Number(rating) : undefined,
      message: String(message).trim(),
      subject: subject ? String(subject) : undefined,
      meta: meta ? String(meta) : undefined,
      language: language ? String(language) : undefined,
    };

    if (formType === "villaComment" && villaId) {
      const slug = String(villaId).trim();
      const villaDocId = await client.fetch(
        `*[_type == "villa" && slug.current == $slug][0]._id`,
        { slug }
      );
      if (!villaDocId) {
        return NextResponse.json(
          { error: "Villa not found." },
          { status: 400 }
        );
      }
      doc.villaRef = {
        _type: "reference",
        _ref: villaDocId,
      };
    }

    const created = await client.create(doc);
    return NextResponse.json({ ok: true, id: created._id });
  } catch (error) {
    console.error("Form submission failed:", error);
    return NextResponse.json(
      { error: "Failed to save submission." },
      { status: 500 }
    );
  }
}
