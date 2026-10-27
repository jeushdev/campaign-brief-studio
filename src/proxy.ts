import { NextResponse, type NextRequest } from "next/server.js";
import { localHost } from "./lib/local-access.ts";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? request.nextUrl.host;
  if (localHost(host)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Allow static Next.js assets and media icons
  if (
    pathname.startsWith("/_next") ||
    pathname === "/icon.svg" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Allow landing website (root /)
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Allow the interactive demo portfolio showcase
  if (pathname === "/demo" || pathname.startsWith("/demo/")) {
    return NextResponse.next();
  }

  // Redirect public visitors requesting other web pages back to the landing website
  if (request.method === "GET" && !pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  // Shield unauthenticated operator API routes from public access
  return NextResponse.json({ error: "Local MVP: loopback access only." }, { status: 403 });
}
