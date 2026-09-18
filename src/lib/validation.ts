import { CAMPAIGN_BRIEF_JSON_SCHEMA, CAMPAIGN_PLAN_JSON_SCHEMA, validateSchema } from "./schema.ts";
import type { CampaignBrief, CampaignPlan } from "./types.ts";
export function validateBrief(input: unknown): { valid: boolean; errors: Record<string, string>; brief: CampaignBrief } {
  const errors: Record<string, string> = {};
  let value = input;
  if (input && typeof input === "object" && !Array.isArray(input)) {
    const source = input as Record<string, unknown>;
    value = Object.fromEntries(Object.entries(source).map(([key, item]) => [key, typeof item === "string" ? item.trim() : item]));
    const normalized = value as Record<string, unknown>;
    if (typeof source.channels === "string") normalized.channels = source.channels.split(",").map((channel) => channel.trim());
    else if (Array.isArray(source.channels)) normalized.channels = source.channels.map((channel) => typeof channel === "string" ? channel.trim() : channel);
  }
  for (const error of validateSchema(value, CAMPAIGN_BRIEF_JSON_SCHEMA, "brief")) {
    const field = error.match(/^brief\.([A-Za-z]+)/)?.[1] ?? "form";
    errors[field] = error;
  }
  return { valid: !Object.keys(errors).length, errors, brief: value as CampaignBrief };
}
export function validatePlan(value: unknown): { valid: boolean; errors: string[]; plan?: CampaignPlan } {
  const errors = validateSchema(value, CAMPAIGN_PLAN_JSON_SCHEMA, "plan");
  return errors.length ? { valid: false, errors } : { valid: true, errors: [], plan: value as CampaignPlan };
}
