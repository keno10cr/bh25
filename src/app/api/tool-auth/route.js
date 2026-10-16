import { NextResponse } from "next/server";
import {
  TOOL_COOKIE,
  TOOL_SESSION_MAX_AGE,
  createToolSessionToken,
  isToolGateConfigured,
  isValidToolPassword,
} from "@/lib/toolAuth";

export async function POST(request) {
  if (!isToolGateConfigured()) {
    return NextResponse.json({ error: "notConfigured" }, { status: 503 });
  }

  let password = "";
  try {
    ({ password = "" } = await request.json());
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (!(await isValidToolPassword(password))) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return NextResponse.json({ error: "wrongPassword" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(TOOL_COOKIE, await createToolSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOOL_SESSION_MAX_AGE,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(TOOL_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
