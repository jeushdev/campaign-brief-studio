import test from "node:test";
import assert from "node:assert/strict";
import { mutationProblem, localHost } from "../src/lib/local-access.ts";
import { sendMutation } from "../src/lib/client-request.ts";
test("local boundary rejects public, rebound and cross-origin requests", () => {
  for (const host of ["example.com", "localhost.evil.com", "127x0x0x1", "192.168.0.1"]) assert.equal(localHost(host), false);
  const request = (origin: string, host = "127.0.0.1:3000") => new Request("http://127.0.0.1:3000/api/briefs", { headers: { host, origin } });
  assert.equal(mutationProblem(request("http://127.0.0.1:3000")), undefined);
  for (const origin of ["", "null", "https://127.0.0.1:3000", "http://evil.com", "http://127.0.0.1:4000"]) assert.ok(mutationProblem(request(origin)));
  assert.ok(mutationProblem(request("http://evil.com", "evil.com")));
});
test("client request preserves saved id on HTTP failure and rejects unreadable/network outcomes", async () => {
  const response = await sendMutation("/api", {}, "stable-key", (async () => Response.json({ id: "saved", error: "Provider failed" }, { status: 502 })) as typeof fetch);
  assert.equal(response.ok, false); assert.equal(response.id, "saved");
  await assert.rejects(sendMutation("/api", {}, "stable-key", (async () => { throw new Error("network"); }) as typeof fetch));
  await assert.rejects(sendMutation("/api", {}, "stable-key", (async () => new Response("<html>error</html>")) as typeof fetch), /same submission/);
});
