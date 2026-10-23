import { validateBrief } from "./validation.ts";

export const BRIEF_STEPS = [
  { label: "Business", heading: "Tell us about the business.", description: "Start with who the campaign is for. Two details are enough to begin.", fields: ["businessName", "industry"] },
  { label: "Campaign", heading: "What should this campaign do?", description: "Connect the offer, the audience, and the action you want them to take.", fields: ["offer", "targetAudience", "objective", "brandVoice", "instructions"] },
  { label: "Channels", heading: "Where will it run?", description: "Choose the channels, then add any rules the draft should follow.", fields: ["channels", "constraints", "sourceMaterial"] },
  { label: "Review", heading: "A final look at your brief.", description: "Check the details together. You can edit any section before creating the campaign draft.", fields: [] },
] as const;

export function stepForBriefField(field: string): number {
  const index = BRIEF_STEPS.findIndex((step) => (step.fields as readonly string[]).includes(field));
  return index < 0 ? 3 : index;
}

export function briefInputErrors(brief: unknown, instructions?: string): Record<string, string> {
  const errors = { ...validateBrief(brief).errors };
  if (instructions !== undefined && !instructions.trim()) errors.instructions = "Revision instructions are required.";
  return errors;
}

export function firstBriefErrorStep(errors: Record<string, string>): number {
  return Math.min(3, ...Object.keys(errors).map(stepForBriefField));
}

export function restoredBriefStep(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < BRIEF_STEPS.length ? value : 0;
}
