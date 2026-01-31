// Gemini-powered fallback classification. Uses env var GEMINI_API_KEY.
// Requires @google/genai installed.

const ALLOWED_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Utilities",
  "Subscription",
  "Insurance",
  "Others"
];

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

function toAllowedCategory(text) {
  if (!text || typeof text !== "string") return "Others";
  const normalized = text.trim().toLowerCase();
  const match = ALLOWED_CATEGORIES.find(
    (c) => c.toLowerCase() === normalized
  );
  return match || "Others";
}

async function aiClassify(description) {
  const prompt = `You are a strict classifier. Classify the given bank transaction description into exactly one of these categories: ${ALLOWED_CATEGORIES.join(
    ", "
  )}.
- Output ONLY the category name with exact spelling.
- If unsure, output Others.

Description: "${description}"`;

  try {
    const mod = await import("@google/genai");
    const { GoogleGenAI } = mod;
    const ai = new GoogleGenAI({}); // picks up GEMINI_API_KEY from env
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
    });
    const raw = typeof response.text === "function" ? await response.text() : response.text;
    return toAllowedCategory(raw);
  } catch (err) {
    // On any failure, fall back to Others
    return "Others";
  }
}

module.exports = { aiClassify, ALLOWED_CATEGORIES };
