const messages: Record<string,string> = {
  businessName: "Enter a business name.",
  industry: "Add the business’s industry.",
  targetAudience: "Describe who you want to reach.",
  offer: "Describe the offer for this campaign.",
  objective: "Add a clear campaign objective.",
  brandVoice: "Describe how the brand should sound.",
  channels: "Choose at least one channel.",
  constraints: "Add at least eight characters describing the guardrails, or write ‘None known.’",
  sourceMaterial: "Use plain text for the source material.",
  instructions: "Explain what should change in this revision.",
};
export function validationMessage(field: string, fallback: string) { return messages[field] ?? fallback; }
