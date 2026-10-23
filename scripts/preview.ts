import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createDemoCases } from "../src/lib/demo-fixtures.ts";
import { openStore } from "../src/lib/sqlite-store.ts";

if (!existsSync(".next-studio/BUILD_ID")) throw new Error("Build the app first with npm run build, then run npm run preview.");
const directory = mkdtempSync(path.join(tmpdir(), "campaign-studio-preview-"));
const database = path.join(directory,"preview.sqlite");
const store = openStore(database);
for (const example of createDemoCases()) {
  const created = store.createAndStart(example.brief,`preview-create-${example.id}`);
  const ready = store.completeAttempt(created.briefId,created.attemptId,example.plan,"Demo");
  if (example.id === "normal") store.reviewBrief(ready.id,ready.version,"Approved","Fictional preview: details reviewed for this example.",false,`preview-approve-${example.id}`);
  if (example.status === "Revision requested") store.reviewBrief(ready.id,ready.version,"Revision requested",example.revisionNote,false,`preview-revise-${example.id}`);
}
store.close();
const port = Number(process.env.CAMPAIGN_PREVIEW_PORT || "3100");
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("CAMPAIGN_PREVIEW_PORT must be between 1 and 65535.");
console.log(`Fictional preview: http://127.0.0.1:${port}/demo`);
console.log("Generation and notifications are disabled. Operator data is not used.");
console.log(`Disposable preview storage: ${database}`);
const child = spawn(process.execPath,["node_modules/next/dist/bin/next","start","--hostname","127.0.0.1","--port",String(port)],{
  windowsHide:true, stdio:"inherit", env:{...process.env,NODE_ENV:"production",N8N_WEBHOOK_URL:"",N8N_APPROVED_WEBHOOK_URL:"",CAMPAIGN_DB_PATH:database,APP_URL:`http://127.0.0.1:${port}`},
});
child.on("error",(error) => { console.error(error); process.exitCode=1; });
child.on("exit",(code) => { process.exitCode=code ?? 0; });
process.once("SIGINT",() => child.kill());
process.once("SIGTERM",() => child.kill());
