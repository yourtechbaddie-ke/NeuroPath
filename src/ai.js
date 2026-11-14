import { getAI, getGenerativeModel, GoogleAIBackend, InferenceMode } from "firebase/ai";
import { app } from "./firebase.js";

const ai = getAI(app, { backend: new GoogleAIBackend() });
const CLOUD = { model: "gemini-2.5-flash" };

// Private step: on-device when Chrome has Gemini Nano, cloud fallback otherwise.
const privateModel = getGenerativeModel(ai, { mode: InferenceMode.PREFER_ON_DEVICE, inCloudParams: CLOUD });
// Heavy step: always cloud.
const cloudModel = getGenerativeModel(ai, { mode: InferenceMode.ONLY_IN_CLOUD, inCloudParams: CLOUD });

// Safety net so obvious identifiers never leave the device even if the model misses them.
const scrub = (t) => t
  .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]")
  .replace(/\+?\d[\d\s().-]{7,}\d/g, "[phone]");

export async function deidentify(text) {
  const r = await privateModel.generateContent(
    "Rewrite this patient statement. Replace names, addresses, phone numbers, emails and exact birth dates with [redacted]. Keep every medical detail unchanged. Return only the rewritten text.\n\n" + scrub(text));
  return {
    text: scrub(r.response.text()),
    source: r.response.inferenceSource ?? "unknown", // verify field name in current SDK docs
  };
}

const BRIEF_PROMPT = `You prepare a pre-consult brief for a surgeon from a de-identified patient statement.
Do NOT diagnose. Return ONLY JSON with keys:
summary (string), timeline (string[]), redFlags (string[]), urgency ("routine"|"soon"|"urgent"),
missingInfo (string[] - records or details a surgeon would need that are absent, e.g. contrast MRI, anticoagulant list),
questionsForSurgeon (string[]).`;

export async function buildBrief(deidentified) {
  const r = await cloudModel.generateContent(BRIEF_PROMPT + "\n\nStatement:\n" + deidentified);
  const raw = r.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(raw);
}