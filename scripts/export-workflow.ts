import fs from "node:fs";
import { buildWorkflow } from "./workflow.ts";
import { CAMPAIGN_BRIEF_JSON_SCHEMA, CAMPAIGN_PLAN_JSON_SCHEMA, CONTRACT_VERSION } from "../src/lib/schema.ts";
const artifacts = {
  "n8n/campaign-brief-studio.json": buildWorkflow(),
  "docs/campaign-plan.schema.json": { $schema: "https://json-schema.org/draft/2020-12/schema", title: "Campaign plan v" + CONTRACT_VERSION, ...CAMPAIGN_PLAN_JSON_SCHEMA },
  "docs/campaign-brief.schema.json": { $schema: "https://json-schema.org/draft/2020-12/schema", title: "Campaign brief v" + CONTRACT_VERSION, ...CAMPAIGN_BRIEF_JSON_SCHEMA },
};
for (const [file, value] of Object.entries(artifacts)) {
  const content = JSON.stringify(value, null, 2) + "\n";
  if (process.argv.includes("--check")) {
    if (fs.readFileSync(file, "utf8").replaceAll("\r\n", "\n") !== content) throw new Error("Generated contract is stale: " + file);
  } else fs.writeFileSync(file, content);
}
