import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { openStore } from "../src/lib/sqlite-store.ts";
import { readPendingRequest, savePendingRequest, clearPendingRequest, pendingStorageKey } from "../src/lib/pending-request.ts";
import { brief } from "./fixtures.ts";

function storage() {
  const entries = new Map<string,string>();
  return { getItem: (key:string) => entries.get(key) ?? null, setItem: (key:string,value:string) => { entries.set(key,value); }, removeItem: (key:string) => { entries.delete(key); } };
}
test("lost create response followed by tab reload replays the committed operation instead of duplicating it", (t) => {
  const directory = mkdtempSync(path.join(tmpdir(), "campaign-recovery-"));
  const store = openStore(path.join(directory,"test.sqlite"));
  t.after(() => { store.close(); rmSync(directory,{recursive:true,force:true}); });
  const session = storage();
  const request = {version:1 as const,url:"/api/briefs",key:randomUUID(),payload:brief};
  savePendingRequest(session,request);
  const committed = store.createAndStart(brief,request.key);
  // The network response is lost; a fresh page has only its persisted request.
  const recovered = readPendingRequest(session,"/api/briefs")!;
  assert.deepEqual(recovered.payload,brief);
  const replayed = store.createAndStart(recovered.payload as typeof brief,recovered.key);
  assert.equal(replayed.briefId,committed.briefId);
  assert.equal(store.listBriefs().length,1);
  assert.equal(readPendingRequest(session,"/api/briefs/other/review"),undefined);
  clearPendingRequest(session,"/api/briefs");
  assert.equal(readPendingRequest(session,"/api/briefs"),undefined);
});
test("malformed recovery data and inaccessible browser storage cannot block the form", () => {
  const session = storage();
  for (const value of ["{",JSON.stringify({version:1,url:"/api/else",key:randomUUID(),payload:brief}),JSON.stringify({version:1,url:"/api/briefs",key:"invalid",payload:brief})]) {
    session.setItem(pendingStorageKey("/api/briefs"),value);
    assert.equal(readPendingRequest(session,"/api/briefs"),undefined);
  }
  const denied = {getItem(){throw new Error("blocked");},setItem(){throw new Error("blocked");},removeItem(){throw new Error("blocked");}};
  assert.doesNotThrow(() => { readPendingRequest(denied,"/api/briefs"); savePendingRequest(denied,{version:1,url:"/api/briefs",key:randomUUID(),payload:brief}); clearPendingRequest(denied,"/api/briefs"); });
});
