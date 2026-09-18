export const CONTRACT_VERSION = 1;
export type Schema = { type: "object" | "array" | "string"; properties?: Record<string, Schema>; required?: string[]; additionalProperties?: false; items?: Schema; minItems?: number; maxItems?: number; minLength?: number; pattern?: string; enum?: string[] };
const text: Schema = { type: "string", minLength: 1, pattern: "\\S" };
const list = (items: Schema, minItems = 1, maxItems?: number): Schema => ({ type: "array", items, minItems, ...(maxItems ? { maxItems } : {}) });
const object = (properties: Record<string, Schema>, required = Object.keys(properties)): Schema => ({ type: "object", additionalProperties: false, properties, required });
export const CAMPAIGN_BRIEF_JSON_SCHEMA = object({
  businessName: text, industry: text, targetAudience: text, offer: text, objective: text, brandVoice: text,
  channels: list(text), constraints: { ...text, minLength: 8 }, sourceMaterial: { type: "string" },
}, ["businessName", "industry", "targetAudience", "offer", "objective", "brandVoice", "channels", "constraints"]);
export const CAMPAIGN_PLAN_JSON_SCHEMA = object({
  briefSummary: text, audienceInsights: list(text),
  messagingAngles: list(object({ title: text, rationale: text, sample: text }), 3, 3),
  landingPageOutline: list(object({ section: text, purpose: text })),
  sevenDayContentPlan: list(object({ day: text, channel: text, format: text, topic: text, CTA: text }), 7, 7),
  assumptions: list(text), risks: list(text), reviewQuestions: list(text),
  confidence: { type: "string", enum: ["high", "medium", "low"] },
});

/** Deliberately limited to the schema vocabulary above; embedded unchanged in n8n. */
export function validateSchema(value: unknown, schema: Schema, path = "value"): string[] {
  const errors: string[] = [];
  if (schema.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [path + " must be an object."];
    const item = value as Record<string, unknown>;
    for (const key of schema.required ?? []) if (!Object.hasOwn(item, key)) errors.push(path + "." + key + " is required.");
    for (const key of Object.keys(item)) {
      if (!Object.hasOwn(schema.properties ?? {}, key)) errors.push(path + "." + key + " is not allowed.");
      else errors.push(...validateSchema(item[key], schema.properties![key], path + "." + key));
    }
  } else if (schema.type === "array") {
    if (!Array.isArray(value)) return [path + " must be an array."];
    if (value.length < (schema.minItems ?? 0) || (schema.maxItems !== undefined && value.length > schema.maxItems)) errors.push(path + " has an invalid item count.");
    value.forEach((item, index) => errors.push(...validateSchema(item, schema.items!, path + "[" + index + "]")));
  } else {
    if (typeof value !== "string") return [path + " must be text."];
    if (schema.minLength && value.trim().length < schema.minLength) errors.push(path + " is too short or blank.");
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(path + " must not be blank.");
    if (schema.enum && !schema.enum.includes(value)) errors.push(path + " has an invalid value.");
  }
  return errors;
}
