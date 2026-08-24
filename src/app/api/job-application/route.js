import { NextResponse } from "next/server";
import {
  createSanityReadClient,
  createSanityServerClient,
} from "@/lib/sanity/client";

export const runtime = "nodejs";

const MAX_BYTES = 24 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXT = /\.(pdf|doc|docx)$/i;

function bad(msg, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function POST(request) {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "Server is not configured to accept applications." },
      { status: 503 }
    );
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return bad("Invalid form data");
  }

  const firstName = String(form.get("firstName") || "").trim();
  const lastName = String(form.get("lastName") || "").trim();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const phone = String(form.get("phone") || "").trim() || undefined;
  const jobSlug = String(form.get("jobSlug") || "").trim();

  if (!firstName) return bad("First name is required");
  if (!lastName) return bad("Last name is required");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return bad("Valid email is required");
  }
  if (!jobSlug) return bad("Job posting is required");

  const resume = form.get("resume");
  if (!(resume instanceof File) || resume.size === 0) {
    return bad("Resume is required");
  }
  if (resume.size > MAX_BYTES) return bad("Resume must be 24 MB or smaller");

  const filename = resume.name || "resume";
  if (!ALLOWED_EXT.test(filename)) {
    return bad("Resume must be a PDF, DOC, or DOCX file");
  }
  if (resume.type && !ALLOWED_MIME.has(resume.type)) {
    return bad("Resume must be a PDF, DOC, or DOCX file");
  }

  const readClient = createSanityReadClient();
  const jobId = await readClient.fetch(
    `*[_type == "jobPosting" && slug.current == $slug && listed == true && !(_id in path("drafts.**"))][0]._id`,
    { slug: jobSlug }
  );
  if (!jobId) return bad("Unknown or inactive job posting");

  try {
    const writeClient = createSanityServerClient();
    const buffer = Buffer.from(await resume.arrayBuffer());
    const asset = await writeClient.assets.upload("file", buffer, {
      filename,
      contentType: resume.type || "application/octet-stream",
    });

    const result = await writeClient.create({
      _type: "jobApplication",
      firstName,
      lastName,
      email,
      phone,
      status: "new",
      submittedAt: new Date().toISOString(),
      jobPosting: { _type: "reference", _ref: jobId, _weak: true },
      resume: {
        _type: "file",
        asset: { _type: "reference", _ref: asset._id },
      },
    });

    return NextResponse.json({ ok: true, id: result._id });
  } catch (error) {
    console.error("[job-application]", error);
    return NextResponse.json(
      { ok: false, error: "Could not save application." },
      { status: 500 }
    );
  }
}
