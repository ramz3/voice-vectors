// =============================================================================
// VOICE SIDEKICK — PROMPT CONSTRUCTION MODULE
// src/lib/promptModule.js
// =============================================================================
//
// Exports:
//   UNIVERSAL_RULES           — hardcoded constant containing the full
//                               Section 9 rules from the PRD. Baked into
//                               every system prompt; cannot be disabled.
//
//   compressProfile(profile)  — FR-07. Runs once at profile activation.
//                               Assembles all raw profile inputs into text,
//                               calls Claude to compress them into an optimized
//                               system prompt, and returns that string for
//                               storage on the profile as compressedPrompt.
//
//   buildRefinementRequest(   — FR-12. Synchronous. Takes a stored compressed
//     compressedPrompt,         prompt and the user's submitted copy. Assembles
//     userCopy                  the three-layer system prompt and returns a
//   )                           complete, ready-to-POST Anthropic API request body.
//
// The split between these two functions is intentional and important:
//   compressProfile()        runs ONCE at activation. Expensive. Result stored.
//   buildRefinementRequest() runs on EVERY refinement. Cheap. No API call.
// =============================================================================

import { ANCHOR_LIBRARY } from "./anchorLibrary.js";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS_REFINEMENT = 1000;  // Per PRD constraint (FR-12)
const MAX_TOKENS_COMPRESSION = 1500; // More headroom needed to generate a full prompt


// =============================================================================
// UNIVERSAL RULES
// Hardcoded. Present in every system prompt. Cannot be overridden by any
// brand profile or user action.
//
// Source: Section 9 of the PRD — Anti-LLM Language Rules, Copywriting Craft
// Principles, and Content Integrity Rules.
//
// Brand-specific instructions (anchors, guardrails) are appended AFTER this
// layer. They narrow and specify; they do not replace.
// =============================================================================

export const UNIVERSAL_RULES = `
## UNIVERSAL WRITING RULES — APPLY TO ALL OUTPUT WITHOUT EXCEPTION

### PART 1: ANTI-LLM LANGUAGE RULES

BANNED WORDS AND PHRASES — never use these in output unless they appear verbatim in the user's input and must be preserved:

Overused AI intensifiers and fillers:
"Dive into", "unlock" (as metaphor), "leverage" (as verb), "elevate", "streamline", "revolutionize", "game-changing", "cutting-edge", "seamless", "robust", "harness", "empower", "holistic", "navigate" (as metaphor), "landscape" (as metaphor), "ecosystem", "synergy", "end-to-end", "best-in-class", "world-class", "comprehensive", "innovative" (as empty descriptor), "realm", "tapestry", "beacon", "embark", "supercharge", "spearhead", "delve"

Overused AI structural phrases:
"In today's [adjective] world...", "In the ever-evolving...", "It's not just about X — it's about Y", "Whether you're [A] or [B]...", "From X to Y, we've got you covered", "At the end of the day", "Take [X] to the next level", "Here's the thing...", "Let's face it...", "But here's where it gets interesting...", "The truth is...", "Imagine a world where...", "Say goodbye to X and hello to Y"

Overused AI sentence patterns — avoid all of these:
- Starting three or more consecutive sentences with the same word
- Tricolon lists that escalate artificially (e.g., "faster, smarter, better")
- Ending paragraphs with a single-sentence dramatic kicker that restates the point
- Using "and that's" as a pivot
- Rhetorical questions as the transition between every paragraph

PUNCTUATION AND TYPOGRAPHIC RULES:
- Em dashes: maximum one pair per paragraph; zero in short-form copy
- Colons as dramatic reveals: once per piece at most
- Ellipses: almost never; reserve only where the brand voice explicitly permits
- Exclamation points: default to zero; one per piece maximum; if the writing needs one to convey energy, the words aren't working hard enough
- Oxford comma: on by default unless brand guardrails specify otherwise
- Quotation marks for emphasis: never; choose a stronger word or restructure
- Parentheticals: maximum one per paragraph

STRUCTURAL PATTERNS TO AVOID:
- The Mirror Opening: opening by restating the reader's situation back to them
- The False Conversational: using "Let's" or "You know what?" to fake informality
- The Exhaustive List: listing everything instead of choosing the strongest items
- The Hedged Superlative: "One of the most...", "Among the best..."
- The Setup-Punchline Paragraph: building to a kicker that restates the premise
- Symmetrical Parallelism Overuse: forcing parallel structure across every sentence

---

### PART 2: COPYWRITING CRAFT PRINCIPLES

CLARITY AND PRECISION:
Every sentence earns its place. Concrete and specific over abstract and general. Use the simplest word that carries the precise meaning. No stacked adjectives. If a sentence can be cut without losing meaning, cut it.

RHYTHM AND READABILITY:
Vary sentence length deliberately — short sentences create momentum, longer ones develop ideas. Paragraph breaks are pacing tools, not visual decoration. The first sentence does the heaviest lifting; it must earn the second.

HONESTY AND SUBSTANCE:
Never inflate a claim beyond what the evidence supports. Specificity builds trust; vague promises erode it. No mealy-mouthed hedging. If you don't know, don't speculate — flag it for the user to verify.

HUMAN QUALITY SIGNALS:
Real writing has slight asymmetry. It has opinions. It breathes — tension and release, speed and pause. A well-placed colloquialism, a deliberately incomplete sentence, an unexpected word choice — these signal a human mind behind the writing. Do not write in patterns. Do not sound like a template.

AUDIENCE RESPECT:
Never condescend. Don't over-explain. Avoid manipulative urgency unless it reflects a genuine constraint stated in the input. Trust the reader's intelligence.

---

### PART 3: CONTENT INTEGRITY RULES

These rules are absolute and cannot be overridden by any brand profile:

1. Do not generate fabricated statistics, fake testimonials, or invented case studies.
2. Preserve specific claims from the user's input exactly — do not rephrase numbers, percentages, or concrete facts.
3. If generating framing or context not present in the input, mark it clearly as a template the user should verify.
4. Comparative claims ("better than," "the only," "first") from the input must be carried forward unchanged; do not invent new ones.
5. Default to prose. Use lists only when content is genuinely a set of parallel items — not as a formatting preference.
6. Formatting serves content. Do not add headers, bullets, or structural elements the content doesn't need.
`.trim();


// =============================================================================
// FUNCTION 1: compressProfile
// FR-07: Profile Activation & Prompt Compression
// =============================================================================

export async function compressProfile(profile, apiKey = null) {

  const assembledProfile = assembleRawProfileText(profile);

  const requestBody = {
    model: MODEL,
    max_tokens: MAX_TOKENS_COMPRESSION,
    system:
      "You are a prompt engineering assistant specializing in brand voice and writing style. " +
      "Your task is to compress brand voice configuration data into dense, optimized system prompt " +
      "instructions for an LLM that will refine copy to match the brand's voice. " +
      "Output only the compressed prompt — no preamble, no explanation, no meta-commentary.",
    messages: [
      {
        role: "user",
        content:
          "Compress these brand voice instructions into a dense, optimized system prompt. " +
          "Preserve all instructional value and specificity. Remove redundancy, tighten language, " +
          "and eliminate anything that doesn't directly guide writing behavior. " +
          "Output only the compressed prompt, nothing else.\n\n" +
          assembledProfile,
      },
    ],
  };

  const headers = {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
  };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `API error ${response.status} ${response.statusText}: ${errorBody}`
      );
    }

    const data = await response.json();
    const compressedPrompt = data.content?.[0]?.text;

    if (!compressedPrompt) {
      throw new Error("API returned an empty response during profile compression.");
    }

    return compressedPrompt.trim();

  } catch (err) {
    throw new Error(`compressProfile failed: ${err.message}`);
  }
}


// =============================================================================
// FUNCTION 2: buildRefinementRequest
// FR-12: Refinement Request — System Prompt Construction
// =============================================================================

export function buildRefinementRequest(compressedPrompt, userCopy) {

  const REFINEMENT_DIRECTIVE = `
## YOUR TASK: VOICE REFINEMENT

Refine the copy below to match this brand's voice. Your only job is to change how it is said — not what is said.

ABSOLUTE RULES:
- Preserve every factual claim, statistic, number, and specific detail exactly as written in the input.
- Do not add information that is not present in the input.
- Do not remove information that is present in the input.
- Do not reframe, restructure, or reorder the core argument or intent.
- Do not change the format (paragraph in → paragraph out; list in → list out).

LIGHT REVISION PROTOCOL:
If your revisions were light — the input was already close to this brand's voice and you made only minor adjustments to phrasing, word choice, or rhythm — append the exact string ##LIGHT_REVISION## on its own line at the very end of your response. Do not include this string if you made substantial revisions.

Output the refined copy only. No preamble, no explanation, no commentary.
`.trim();

  const systemPrompt = [
    UNIVERSAL_RULES,
    "\n\n---\n\n## BRAND VOICE PROFILE\n\n" + compressedPrompt,
    "\n\n---\n\n" + REFINEMENT_DIRECTIVE,
  ].join("");

  return {
    model: MODEL,
    max_tokens: MAX_TOKENS_REFINEMENT,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userCopy,
      },
    ],
  };
}


// =============================================================================
// HELPER: assembleRawProfileText
// Internal — used only by compressProfile()
// =============================================================================

function assembleRawProfileText(profile) {
  const lines = [];

  lines.push(`BRAND: ${profile.brandName}`);
  lines.push(`BUSINESS MODEL: ${profile.businessModel}`);
  lines.push(`INDUSTRY: ${profile.industry}`);
  lines.push(`PRIMARY MARKET: ${profile.primaryMarket}`);
  lines.push("");

  lines.push("## AUDIENCE PROFILE");

  const motivationMap = {
    "pain-driven":        "Pain-driven — audience leads with problem recognition; copy should open with empathy and resolve to relief",
    "aspiration-driven":  "Aspiration-driven — audience leads with possibility and upward momentum; copy should open with vision",
    "mandate-driven":     "Mandate-driven — audience prioritizes efficiency and credibility; copy should lead with ease and proof",
    "curiosity-driven":   "Curiosity-driven — audience responds to intrigue and education; copy should open with a hook or question",
  };
  lines.push(`Primary motivation: ${motivationMap[profile.audience.motivationType] || profile.audience.motivationType}`);
  lines.push(`Emotional state at contact: ${profile.audience.emotionalState.join(", ")}`);

  const riskVal = profile.audience.riskRelationship;
  lines.push(
    `Relationship to risk: ${riskVal}/100 — ${
      riskVal < 34 ? "low stakes; minimal doubt-removal needed" :
      riskVal < 67 ? "moderate stakes; some reassurance and credibility signals are helpful" :
      "high stakes; build in doubt-removal, social proof, and reassurance throughout"
    }`
  );

  const identVal = profile.audience.identityAlignment;
  lines.push(
    `Identity alignment: ${identVal}/100 — ${
      identVal < 34 ? "primarily functional; speak to outcomes, specs, and ROI" :
      identVal < 67 ? "mixed; balance practical outcomes with identity and values" :
      "strongly identity-driven; speak to self-image, belonging, and values alongside outcomes"
    }`
  );

  if (profile.audience.sophisticationLevel !== null) {
    const sophVal = profile.audience.sophisticationLevel;
    lines.push(
      `Sophistication level: ${sophVal}/100 — ${
        sophVal < 34 ? "novice; more explanation, accessible vocabulary" :
        sophVal < 67 ? "intermediate; some assumed knowledge" :
        "expert-adjacent; assume knowledge, do not over-explain"
      }`
    );
  }

  if (profile.audience.decisionConfidence) {
    const confMap = {
      "confident-comparative": "Confident and comparative — they know what they want and are evaluating options",
      "uncertain-seeking":     "Uncertain and seeking guidance — they need orientation before they can decide",
      "informed-cautious":     "Informed but cautious — they've done research but want validation before committing",
    };
    lines.push(`Decision confidence: ${confMap[profile.audience.decisionConfidence] || profile.audience.decisionConfidence}`);
  }

  if (profile.audience.stakeholderComplexity) {
    const stakeMap = {
      "solo":              "Solo decision-maker — write to one person with full authority",
      "small-group":       "Small group (2–4 people) — content may need to travel across stakeholders",
      "complex-committee": "Complex buying committee — multiple stakeholders with different priorities",
    };
    lines.push(`Stakeholder complexity: ${stakeMap[profile.audience.stakeholderComplexity] || profile.audience.stakeholderComplexity}`);
  }

  if (profile.audience.audienceNotes?.trim()) {
    lines.push(`Additional audience context: ${profile.audience.audienceNotes.trim()}`);
  }

  lines.push("");
  lines.push("## PERSONALITY ANCHORS");
  lines.push("Apply all selected anchors simultaneously — they define this brand's voice collectively, not as alternatives.");
  lines.push("");

  const categoryLabels = Object.fromEntries(
    Object.entries(ANCHOR_LIBRARY).map(([key, cat]) => [key, cat.categoryLabel])
  );

  profile.anchors.forEach((anchor, i) => {
    const catLabel = categoryLabels[anchor.category] || anchor.category;
    lines.push(`Anchor ${i + 1}: ${anchor.label} [${catLabel}]`);
    lines.push(`Instruction: ${anchor.llmInstruction}`);
    lines.push("");
  });

  lines.push("## GUARDRAILS");

  if (profile.guardrails.toneBoundaries.length > 0) {
    lines.push("This brand never sounds like:");
    profile.guardrails.toneBoundaries.forEach((b) => lines.push(`  - ${b}`));
  }

  if (profile.guardrails.vocabularyBlacklist.length > 0) {
    lines.push("Never use these words or phrases in output:");
    lines.push(`  ${profile.guardrails.vocabularyBlacklist.join(", ")}`);
  }

  if (profile.guardrails.vocabularyPreferences.length > 0) {
    lines.push("Vocabulary preferences:");
    profile.guardrails.vocabularyPreferences.forEach((p) => lines.push(`  - ${p}`));
  }

  if (profile.guardrails.stylisticRules.length > 0) {
    lines.push("Stylistic rules:");
    profile.guardrails.stylisticRules.forEach((r) => lines.push(`  - ${r}`));
  }

  lines.push("");

  const summaries = profile.referenceMaterials.filter((m) => m.summary?.trim());
  if (summaries.length > 0) {
    lines.push("## BRAND REFERENCE MATERIAL SUMMARIES");
    lines.push("Use these as evidence of voice — not as content to copy directly.");
    lines.push("");
    summaries.forEach((mat, i) => {
      const source = mat.type === "file" ? mat.fileName : "Pasted text";
      lines.push(`Reference ${i + 1} (${source}):`);
      lines.push(mat.summary.trim());
      lines.push("");
    });
  }

  return lines.join("\n").trim();
}
