export function localHost(host: string | null): boolean {
  return !!host && /^(localhost|127\.0\.0\.1|\[::1\]|host\.docker\.internal|campaign-brief-studio)(?::\d+)?$/i.test(host);
}
export function mutationProblem(request: Request): string | undefined {
  const host = request.headers.get("host");
  if (!localHost(host)) return "This MVP only accepts loopback hosts.";
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    if (origin.host.toLowerCase() !== host!.toLowerCase() || origin.protocol !== new URL(request.url).protocol || origin.username || origin.password || request.headers.get("sec-fetch-site") === "cross-site") throw new Error();
  } catch { return "A same-origin request is required."; }
}
