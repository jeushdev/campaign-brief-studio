import test from "node:test";
import assert from "node:assert/strict";
import { mutationProblem, localHost } from "../src/lib/local-access.ts";
import { proxy } from "../src/proxy.ts";
import { NextRequest } from "next/server.js";
import { sendMutation } from "../src/lib/client-request.ts";

test("local boundary rejects public, rebound and cross-origin requests", () => {
  for (const host of ["example.com", "localhost.evil.com", "127x0x0x1", "192.168.0.1"]) assert.equal(localHost(host), false);
  const request = (origin: string, host = "127.0.0.1:3000") => new Request("http://127.0.0.1:3000/api/briefs", { headers: { host, origin } });
  assert.equal(mutationProblem(request("http://127.0.0.1:3000")), undefined);
  for (const origin of ["", "null", "https://127.0.0.1:3000", "http://evil.com", "http://127.0.0.1:4000"]) assert.ok(mutationProblem(request(origin)));
  assert.ok(mutationProblem(request("http://evil.com", "evil.com")));
});

test("DEMO_MODE never bypasses local Host or same-origin mutation checks", (t) => {
  const previous = process.env.DEMO_MODE;
  t.after(() => { if (previous === undefined) delete process.env.DEMO_MODE; else process.env.DEMO_MODE = previous; });
  process.env.DEMO_MODE = "true";
  assert.ok(mutationProblem(new Request("http://evil.test/api/briefs", { headers: { host: "evil.test", origin: "http://evil.test" } })));
  assert.ok(mutationProblem(new Request("http://127.0.0.1:3000/api/briefs", { headers: { host: "127.0.0.1:3000", origin: "http://evil.test" } })));
});

test("client request preserves saved id on HTTP failure and rejects unreadable/network outcomes", async () => {
  const response = await sendMutation("/api", {}, "stable-key", (async () => Response.json({ id: "saved", error: "Provider failed" }, { status: 502 })) as typeof fetch);
  assert.equal(response.ok, false); assert.equal(response.id, "saved");
  await assert.rejects(sendMutation("/api", {}, "stable-key", (async () => { throw new Error("network"); }) as typeof fetch));
  await assert.rejects(sendMutation("/api", {}, "stable-key", (async () => new Response("<html>error</html>")) as typeof fetch), /same submission/);
});

test("proxy router redirects public page traffic to demo while guarding operator API", () => {
  const rootReq = new NextRequest("https://spectacular-mochi-1afdfe.netlify.app/");
  const rootRes = proxy(rootReq);
  assert.equal(rootRes.status, 302);
  assert.equal(rootRes.headers.get("location"), "https://spectacular-mochi-1afdfe.netlify.app/demo");

  const demoReq = new NextRequest("https://spectacular-mochi-1afdfe.netlify.app/demo");
  const demoRes = proxy(demoReq);
  assert.equal(demoRes.status, 200);

  const staticReq = new NextRequest("https://spectacular-mochi-1afdfe.netlify.app/_next/static/chunk.js");
  const staticRes = proxy(staticReq);
  assert.equal(staticRes.status, 200);

  const campaignsReq = new NextRequest("https://spectacular-mochi-1afdfe.netlify.app/campaigns");
  const campaignsRes = proxy(campaignsReq);
  assert.equal(campaignsRes.status, 302);
  assert.equal(campaignsRes.headers.get("location"), "https://spectacular-mochi-1afdfe.netlify.app/demo");

  const apiReq = new NextRequest("https://spectacular-mochi-1afdfe.netlify.app/api/briefs", { method: "POST" });
  const apiRes = proxy(apiReq);
  assert.equal(apiRes.status, 403);

  const localReq = new NextRequest("http://127.0.0.1:3000/api/briefs", { headers: { host: "127.0.0.1:3000" } });
  const localRes = proxy(localReq);
  assert.equal(localRes.status, 200);
});
