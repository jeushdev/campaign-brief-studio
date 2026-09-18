import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Activity, BriefStatus, CampaignBrief, CampaignPlan, StoredBrief } from "./types";
const file = path.join(process.cwd(), "data", "briefs.json");
async function read(): Promise<StoredBrief[]> { try { return JSON.parse(await fs.readFile(file, "utf8")) as StoredBrief[]; } catch { return []; } }
async function write(data: StoredBrief[]) { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, JSON.stringify(data, null, 2)); }
const event = (action: string, detail: string): Activity => ({ id: randomUUID(), at: new Date().toISOString(), action, detail });
export async function listBriefs() { return (await read()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); }
export async function getBrief(id: string) { return (await read()).find((brief) => brief.id === id); }
export async function createBrief(brief: CampaignBrief) { const now = new Date().toISOString(); const record: StoredBrief = { id: randomUUID(), createdAt: now, updatedAt: now, status: "Draft", brief, activities: [event("Draft created", "Input normalized and stored locally.")] }; const all = await read(); all.push(record); await write(all); return record; }
export async function updateBrief(id: string, patch: Partial<Pick<StoredBrief, "status" | "plan" | "reviewNote">>, action: string, detail: string) { const all = await read(); const index = all.findIndex((brief) => brief.id === id); if (index < 0) return undefined; const current = all[index]; all[index] = { ...current, ...patch, updatedAt: new Date().toISOString(), activities: [...current.activities, event(action, detail)] }; await write(all); return all[index]; }
export async function saveGeneratedPlan(id: string, plan: CampaignPlan, mode: "Webhook" | "Demo") { return updateBrief(id, { status: "Needs review", plan }, "Generation validated", `${mode} output passed the required campaign-plan schema and is awaiting human review.`); }
export async function failBrief(id: string, detail: string) { return updateBrief(id, { status: "Failed" }, "Generation failed", detail); }
export async function setStatus(id: string, status: BriefStatus, note: string) { return updateBrief(id, { status, reviewNote: note || undefined }, `Review: ${status}`, note || "No reviewer note provided."); }
