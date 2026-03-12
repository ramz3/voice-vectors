// =============================================================================
// VOICE SIDEKICK — DEMO RUNNER
// Usage: ANTHROPIC_API_KEY=sk-... node demo.js
// =============================================================================
//
// Uses the pre-built SAMPLE_BRAND_PROFILE (Studio North) to refine a sample
// paragraph. No profile compression needed — the compressedPrompt is already
// stored on the profile.
// =============================================================================

import { SAMPLE_BRAND_PROFILE } from "./src/lib/brandProfile.js";
import { buildRefinementRequest } from "./src/lib/promptModule.js";

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error("Error: set ANTHROPIC_API_KEY environment variable first.");
  console.error("  export ANTHROPIC_API_KEY=sk-ant-...");
  process.exit(1);
}

// Sample copy to refine — generic marketing prose, not yet in Studio North's voice
const INPUT_COPY = `
We are a world-class design agency that leverages cutting-edge methodologies to
transform your brand. Our innovative approach delivers seamless, end-to-end solutions
that empower your team and move the needle on key metrics. Let's embark on a journey
together to elevate your business to the next level.
`.trim();

console.log("Brand profile:", SAMPLE_BRAND_PROFILE.brandName);
console.log("Anchors:", SAMPLE_BRAND_PROFILE.anchors.map(a => a.label).join(", "));
console.log("\n--- INPUT COPY ---");
console.log(INPUT_COPY);
console.log("\nRefining...\n");

const requestBody = buildRefinementRequest(
  SAMPLE_BRAND_PROFILE.compressedPrompt,
  INPUT_COPY
);

const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
    "x-api-key": API_KEY,
  },
  body: JSON.stringify(requestBody),
});

if (!response.ok) {
  const err = await response.text();
  console.error("API error:", response.status, err);
  process.exit(1);
}

const data = await response.json();
const refined = data.content?.[0]?.text ?? "(no output)";

console.log("--- REFINED COPY ---");
console.log(refined);

const lightRevision = refined.includes("##LIGHT_REVISION##");
if (lightRevision) {
  console.log("\n(flagged as light revision — input was already close to brand voice)");
}
