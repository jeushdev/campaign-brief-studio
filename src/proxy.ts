import { NextResponse, type NextRequest } from "next/server";
import { localHost } from "./lib/local-access";
export function proxy(request: NextRequest) {
  if (!localHost(request.headers.get("host"))) return NextResponse.json({ error: "Local MVP: loopback access only." }, { status: 403 });
  return NextResponse.next();
}
