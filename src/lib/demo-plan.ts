import type { CampaignBrief, CampaignPlan } from "./types";

const campaignIdeas: Record<string, { insight: string; angles: [string, string, string]; formats: string[] }> = {
  "Coffee shop": {
    insight: "A nearby audience may respond to a clear occasion and convenient visit details; confirm local demand before launch.",
    angles: ["A pause in the day", "Made for the neighborhood", "A simple first visit"],
    formats: ["Photo post", "Short video", "Story sequence", "Menu spotlight"],
  },
  "Food and beverage": {
    insight: "Specific menu details can make the offer easier to evaluate; verify availability and dietary information before publishing.",
    angles: ["The menu, plainly told", "A reason to gather", "What to expect"],
    formats: ["Menu feature", "Kitchen note", "Photo post", "FAQ"],
  },
  "Wellness studio": {
    insight: "People may want to understand the experience and practical details before booking; avoid health outcome promises.",
    angles: ["Know the first session", "A routine that fits", "Meet the practice"],
    formats: ["Class overview", "Instructor note", "FAQ", "Booking reminder"],
  },
  "Professional services": {
    insight: "Prospective clients may need clarity on scope, process, and fit; validate these questions in real conversations.",
    angles: ["A clear starting point", "The process in view", "Fit before commitment"],
    formats: ["Process explainer", "Checklist", "FAQ", "Founder note"],
  },
};

function formatForChannel(channel: string, dayIndex: number, fallbackFormats: string[]) {
  const normalized = channel.toLowerCase();
  if (normalized.includes("email")) return ["Welcome email", "Offer email", "FAQ email", "Reminder email"][dayIndex % 4];
  if (normalized.includes("linkedin")) return ["Text post", "Document post", "Founder note", "Question post"][dayIndex % 4];
  if (normalized.includes("instagram")) return ["Photo post", "Story sequence", "Short video", "Carousel"][dayIndex % 4];
  if (normalized.includes("facebook")) return ["Community post", "Photo post", "Event update", "FAQ"][dayIndex % 4];
  if (normalized.includes("tiktok")) return ["Short video", "Behind-the-scenes clip", "Question video", "Offer explainer"][dayIndex % 4];
  if (normalized.includes("website") || normalized.includes("landing")) return ["Landing-page section", "FAQ entry", "Offer detail", "Call-to-action block"][dayIndex % 4];
  return fallbackFormats[dayIndex % fallbackFormats.length];
}

export function createDemoPlan(brief: CampaignBrief): CampaignPlan {
  const industry = brief.industry.trim().toLowerCase();
  const strategy = Object.entries(campaignIdeas).find(([key]) => industry.includes(key.toLowerCase()))?.[1];
  const angles = strategy?.angles ?? ["Make the offer clear", "Show how it works", "Invite a small next step"];
  const formats = strategy?.formats ?? ["Offer explainer", "Short post", "FAQ", "Process note"];
  const selectedChannels = brief.channels.length ? brief.channels : ["Email"];
  const themes = [
    "Introduce the audience and the problem the offer addresses",
    "Explain what is included and who it is for",
    "Answer a practical question before the first step",
    "Show the process in plain language",
    "Clarify availability, eligibility, or constraints",
    "Invite the audience to consider whether it is a fit",
    "Repeat the next step with the key details",
  ];

  return {
    briefSummary: `${brief.businessName} is preparing a campaign for ${brief.targetAudience}. The goal: ${brief.objective.toLowerCase()}. The proposed offer is ${brief.offer}.`,
    audienceInsights: [
      strategy?.insight ?? `The brief identifies ${brief.targetAudience} as the audience; validate their needs and decision process before launch.`,
      `The stated goal is ${brief.objective.toLowerCase()}; use a clear call to action and measure the response with a defined method.`,
      `Use a ${brief.brandVoice.toLowerCase()} voice consistently. These are brief-based planning hypotheses, not verified audience research.`,
    ],
    messagingAngles: angles.map((title, index) => ({
      title,
      rationale: [
        `Lead with the practical value of ${brief.offer} for ${brief.targetAudience}.`,
        `Make the experience and its limits easy to understand for a ${brief.industry.toLowerCase()} audience.`,
        `Give interested people a low-pressure next step that supports the campaign goal: ${brief.objective.toLowerCase()}.`,
      ][index],
      sample: [
        `${brief.businessName}: ${brief.offer}. See what is included and decide whether it fits your needs.`,
        `Considering ${brief.offer}? Here is how it works, who it is for, and what to expect from ${brief.businessName}.`,
        `Explore the details of ${brief.offer} and contact ${brief.businessName} when you are ready to learn more.`,
      ][index],
    })),
    landingPageOutline: [
      { section: "Introduction", purpose: `Name ${brief.targetAudience} and explain the offer in one direct sentence.` },
      { section: "The need", purpose: "Describe the audience's stated challenge without assuming it applies to everyone." },
      { section: "Offer details", purpose: `Explain what ${brief.offer} includes, its eligibility, and any relevant limits.` },
      { section: "How it works", purpose: "Set out the steps, timing, and information a person needs to decide." },
      { section: "Questions", purpose: "Answer common practical questions and make unresolved details visible." },
      { section: "Next step", purpose: `Invite suitable visitors to take a clear next step. Keep it aligned with the goal: ${brief.objective.toLowerCase()}.` },
    ],
    sevenDayContentPlan: themes.map((topic, index) => {
      const channel = selectedChannels[index % selectedChannels.length];
      return {
        day: `Day ${index + 1}`,
        channel,
        format: formatForChannel(channel, index, formats),
        topic,
        CTA: index === 6 ? "Review the offer details" : index === 2 ? "Read the offer details" : "Learn more",
      };
    }),
    assumptions: [
      "The offer is available to the stated audience and its details can be confirmed by the business.",
      "The selected channels are available to the business and appropriate for this audience.",
      "The team can define a practical measure for the campaign objective before launch.",
    ],
    risks: [
      "Audience observations are planning hypotheses because no research source is connected.",
      `Confirm every detail of ${brief.offer} and follow the stated constraint: ${brief.constraints}`,
      "Check local, platform, and industry rules before using regulated or comparative claims.",
    ],
    reviewQuestions: [
      "Which factual details and evidence are approved for use in public copy?",
      "Are there audience exclusions, channel restrictions, or required disclosures?",
      "Who will approve the final material and confirm that the offer is current?",
    ],
    confidence: "medium",
  };
}
