import { createDemoPlan } from "../src/lib/demo-plan.ts";
export const brief = { businessName: "Test Studio", industry: "Software", targetAudience: "Small teams", offer: "A free audit", objective: "Generate leads", brandVoice: "Clear", channels: ["Email"], constraints: "No unsupported claims." };
export const plan = () => createDemoPlan(brief);
