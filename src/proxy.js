import { NextResponse } from "next/server";
import { TOOL_COOKIE, isValidToolSession } from "@/lib/toolAuth";

export async function proxy(request) {
  if (await isValidToolSession(request.cookies.get(TOOL_COOKIE)?.value)) {
    return NextResponse.next();
  }
  const gate = new URL("/tool-access", request.url);
  gate.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.rewrite(gate);
}

export const config = {
  matcher: ["/bhgr", "/ccen", "/cces"],
};
