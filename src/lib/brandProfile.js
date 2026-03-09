// =============================================================================
// VOICE SIDEKICK — BRAND PROFILE DATA MODEL
// src/lib/brandProfile.js
// =============================================================================
//
// Exports:
//   EMPTY_BRAND_PROFILE  — canonical object shape for a new brand profile.
//                          Copy this when creating a new brand; never mutate it.
//
//   SAMPLE_BRAND_PROFILE — fully populated fictional brand ("Studio North")
//                          showing what a complete, active profile looks like.
//                          Use for development, testing, and onboarding.
//
// Storage notes (FR-17):
//   Each brand profile is stored as a single serialized object in window.storage
//   under the key "brand:{id}" (e.g., "brand:brand_1709059200000").
//   A separate index key "brands:index" holds an array of { id, brandName,
//   status, updatedAt } entries and is updated on every create, edit, or delete.
//   All storage operations must be wrapped in try/catch with visible error handling.
// =============================================================================

import { getAnchorById } from "./anchorLibrary.js";


// -----------------------------------------------------------------------------
// EMPTY BRAND PROFILE
// The canonical shape. All required fields are null; optional fields are null
// or empty arrays/strings. Use this as the base for new brand creation.
// -----------------------------------------------------------------------------

export const EMPTY_BRAND_PROFILE = {

  // --- Identity ---
  id: null,
  // String: unique identifier, generated at creation time
  // Format: "brand_" + Date.now() (e.g., "brand_1709059200000")

  brandName: null,
  // String: client or brand name displayed throughout the UI

  status: "draft",
  // "draft"  → setup incomplete; not selectable in the refinement flow
  // "active" → locked in; selectable by all team members

  createdAt: null,
  // String: ISO 8601 timestamp (e.g., "2026-02-27T14:30:00.000Z")

  updatedAt: null,
  // String: ISO 8601 timestamp; updated on every save

  // --- Phase B: Brand Context ---

  businessModel: null,
  // "B2B" | "B2C" | "B2B2C" | "Hybrid"

  industry: null,
  // String: from predefined list or freeform entry
  // e.g., "SaaS / Enterprise Software", "Consumer Packaged Goods"

  primaryMarket: null,
  // String: geography and primary market(s)
  // e.g., "North America, US-primary", "Global, English-language markets"

  // --- Phase C: Primary Audience ---

  audience: {

    // Required

    motivationType: null,
    // "pain-driven"       → copy leads with problem recognition, empathy, resolution
    // "aspiration-driven" → copy leads with possibility, vision, upward momentum
    // "mandate-driven"    → copy leads with efficiency, credibility, ease
    // "curiosity-driven"  → copy leads with intrigue, education, gentle hooks

    emotionalState: [],
    // Array of 1–2 strings from:
    // "overwhelmed" | "skeptical" | "frustrated" | "anxious"
    // "curious" | "excited" | "resigned"

    riskRelationship: null,
    // Number 0–100
    // 0   = low stakes  → minimal doubt-removal needed
    // 100 = high stakes → heavy reassurance, social proof, and doubt-removal throughout

    identityAlignment: null,
    // Number 0–100
    // 0   = purely functional  → speak to outcomes, specs, ROI
    // 100 = identity-driven    → speak to self-image, belonging, values

    // Optional (null if not set)

    sophisticationLevel: null,
    // Number 0–100 | null
    // 0   = novice  → more explanation, simpler vocabulary
    // 100 = expert  → assumed knowledge, no over-explaining

    decisionConfidence: null,
    // "confident-comparative" | "uncertain-seeking" | "informed-cautious" | null

    stakeholderComplexity: null,
    // "solo" | "small-group" | "complex-committee" | null
    // Primarily relevant for B2B; null for B2C

    audienceNotes: "",
    // Freeform string: cultural context, generational nuances, insider language,
    // community dynamics — anything the structured inputs didn't capture.
    // Passed to the LLM as supplementary audience context.
  },

  // --- Phase D: Personality Anchors ---

  anchors: [],
  // Array of 3–5 anchor objects. Each is copied from ANCHOR_LIBRARY at
  // selection time and stored here with all three layers intact.
  // Minimum 3, maximum 5 — enforced in the setup UI.
  //
  // Shape of each stored anchor object:
  // {
  //   id:             String — matches the id in ANCHOR_LIBRARY
  //   label:          String — user-facing label
  //   category:       String — "emotionalRegister" | "intellectualPosture"
  //                           | "relationshipPosture" | "craftAndStyle"
  //   description:    String — shown in setup UI on selection
  //   llmInstruction: String — passed to Claude; not shown in UI
  // }
  //
  // To add an anchor during setup, use getAnchorById(id) from anchorLibrary.js
  // to retrieve the full anchor object (including llmInstruction) and push it here.

  // --- Phase E: Guardrails ---

  guardrails: {

    toneBoundaries: [],
    // Array of strings: what this brand never sounds like
    // e.g., ["never aggressive", "never clinical or cold", "never flippant"]

    vocabularyBlacklist: [],
    // Array of strings: specific words or phrases to exclude from all output
    // e.g., ["leverage", "synergy", "disrupt", "journey", "transform"]

    vocabularyPreferences: [],
    // Array of strings: preferred substitutions
    // e.g., ["'people' not 'users'", "'work' not 'deliverables'"]

    stylisticRules: [],
    // Array of strings: specific conventions to enforce
    // e.g., ["Oxford comma always", "No exclamation points", "Contractions are fine"]
  },

  // --- Phase A: Reference Materials ---

  referenceMaterials: [],
  // Array of material objects — one per uploaded file or pasted text block.
  //
  // IMPORTANT: Two text fields exist for different purposes:
  //   extractedText → full text extracted from the file or paste.
  //                   Stored for admin reference display ONLY.
  //                   NEVER included in API prompts directly.
  //   summary       → ≤300-word Claude-generated summary (FR-06b).
  //                   This IS what gets included in the system prompt.
  //
  // Shape of each material object:
  // {
  //   id:            String  — "mat_" + Date.now()
  //   type:          "file" | "paste"
  //   fileName:      String | null  — original filename; null for pastes
  //   fileSize:      Number | null  — size in bytes; null for pastes
  //   extractedText: String  — full extracted text (display only, never sent to API)
  //   summary:       String  — ≤300-word voice summary (sent to API via compressedPrompt)
  //   uploadedAt:    String  — ISO 8601 timestamp
  // }

  // --- Compressed Prompt (FR-07) ---

  compressedPrompt: null,
  // String | null
  // Generated once by compressProfile() at activation time.
  // Stored here and used directly in every refinement request.
  // null until the profile is activated for the first time.
  // Regenerated if the admin edits and re-activates the profile.
  // This is the assembled, Claude-optimized system prompt — no dynamic
  // reassembly happens at refinement time.
};


// -----------------------------------------------------------------------------
// SAMPLE BRAND PROFILE — "Studio North"
// A fully populated fictional brand for development and testing.
//
// Studio North is a B2B design consultancy serving founders and senior leaders
// at mid-stage tech companies. Their voice is sharp, peer-level, and direct —
// they write like the smartest person in the room who doesn't need you to know it.
//
// This is intentionally a strong, distinctive voice configuration so it can
// serve as a useful contrast against a second test brand.
// -----------------------------------------------------------------------------

export const SAMPLE_BRAND_PROFILE = {

  id: "brand_1709059200000",
  brandName: "Studio North",
  status: "active",
  createdAt: "2026-02-27T14:00:00.000Z",
  updatedAt: "2026-02-27T15:42:00.000Z",

  businessModel: "B2B",
  industry: "Design consultancy / Creative services",
  primaryMarket: "North America, US-primary",

  audience: {
    motivationType: "aspiration-driven",
    emotionalState: ["curious", "excited"],
    riskRelationship: 35,
    identityAlignment: 72,
    sophisticationLevel: 78,
    decisionConfidence: "informed-cautious",
    stakeholderComplexity: "small-group",
    audienceNotes:
      "Founders and senior leaders at mid-stage tech companies (Series A–C). Often self-identify as design-forward even when their organizations aren't fully there yet. They appreciate craft and have strong aesthetic opinions, but they buy on outcomes — revenue, retention, conversion — not on craft for its own sake. Skeptical of agency-speak; will tune out anything that sounds like a pitch. They respond to directness and to being treated as capable of handling an honest assessment.",
  },

  anchors: [
    {
      id: "quietly-confident",
      label: "Quietly Confident",
      category: "emotionalRegister",
      description:
        "Authority without volume. Says what it thinks once, clearly. Never oversells, never justifies itself unnecessarily.",
      llmInstruction:
        "Write with deep, understated confidence. State positions directly and without hedging. Never use superlatives, hyperbole, or self-promotional framing. The confidence is in the precision of the language, not its volume. Do not over-explain or pre-emptively defend claims — let the substance carry the authority. Avoid phrases that seek validation or signal uncertainty ('we believe,' 'we think,' 'hopefully,' 'in our opinion').",
    },
    {
      id: "sharp-and-opinionated",
      label: "Sharp and Opinionated",
      category: "intellectualPosture",
      description:
        "Takes clear positions. No equivocation. Knows what it thinks and says so without hiding behind passive constructions.",
      llmInstruction:
        "Take clear, specific positions. No both-sidesing, no mealy-mouthed equivocation, no 'it depends' as a final answer. The writing knows what it thinks and says so in active voice. Opinions are stated as such — directly and attributed clearly ('We think,' 'The answer is,' 'This approach doesn't work'). Do not hide positions in passive constructions or bury them in qualifications.",
    },
    {
      id: "peer-not-vendor",
      label: "Peer Not Vendor",
      category: "relationshipPosture",
      description:
        "Writes as if to an equal, not a buyer. No sales register. Assumes shared context and intelligence.",
      llmInstruction:
        "Write as if to a peer — someone at the same level, with shared context and comparable intelligence. Eliminate sales register entirely: no CTAs that assume the reader needs convincing, no features-and-benefits framing, no over-explanation of obvious stakes. Use 'we' and 'you' as collaborators working on the same problem, not as brand and customer. Assume the reader already understands the stakes.",
    },
    {
      id: "conversational-with-craft",
      label: "Conversational with Craft",
      category: "craftAndStyle",
      description:
        "Sounds like a very smart person talking. Natural rhythm, informal where appropriate, but every sentence is still precise and intentional.",
      llmInstruction:
        "Write in the register of a very intelligent person speaking — natural rhythm, contractions where they feel right, informal transitions that don't sound like formal essay prose. But 'conversational' does not mean loose or imprecise. Every sentence is still carefully constructed. The informality is tonal, not structural — it sounds effortless because the craft is invisible, not absent.",
    },
  ],

  guardrails: {
    toneBoundaries: [
      "Never corporate or buttoned-up",
      "Never self-important or preachy",
      "Never overly earnest — a light, dry wit is fine",
      "Never salesy or pitch-driven",
    ],
    vocabularyBlacklist: [
      "innovative", "cutting-edge", "world-class", "transform", "transformation",
      "journey", "empower", "deliverables", "bandwidth", "circle back",
      "touch base", "move the needle", "at the end of the day",
    ],
    vocabularyPreferences: [
      "'work' not 'deliverables'",
      "'people' not 'users'",
      "'thinking' not 'insights'",
      "'built' not 'crafted' — avoid over-precious language",
      "'clients' not 'partners' unless the relationship is genuinely a partnership",
    ],
    stylisticRules: [
      "Contractions are fine and preferred in conversational register",
      "No exclamation points",
      "Oxford comma always",
      "First person plural ('we') preferred over brand name in body copy",
      "Short paragraphs — rarely more than 3 sentences",
      "No bullet lists unless content is genuinely a set of parallel items",
    ],
  },

  referenceMaterials: [
    {
      id: "mat_1709059300000",
      type: "file",
      fileName: "studio-north-brand-guidelines-2025.pdf",
      fileSize: 2457600,
      extractedText:
        "[Full extracted text stored here for admin reference display only — never sent to the API]",
      summary:
        "Studio North's voice is built on earned authority and directness. The brand does not announce its expertise — it demonstrates it through the specificity and confidence of its language. Writing should read as if coming from a senior practitioner talking to a peer, not a vendor presenting to a prospect. The brand avoids agency clichés entirely. Key voice markers: clear positions stated without hedging, concrete language over abstraction, dry understatement preferred over enthusiasm, and a willingness to name problems others soften. Studio North's clients are smart and know it; the writing should treat them that way. Reference phrases from approved copy: 'Most design problems are product problems in disguise.' 'We don't do branding that looks like branding.' 'If you can describe the visual system in a sentence, it's not working.'",
      uploadedAt: "2026-02-27T14:05:00.000Z",
    },
  ],

  compressedPrompt:
    "You are writing copy for Studio North, a B2B design consultancy serving founders and senior leaders at mid-stage tech companies (Series A–C). " +
    "Write to a peer — design-literate, outcome-oriented, and skeptical of agency-speak. They buy on results, not craft. " +
    "VOICE: Quietly confident — state positions once, directly, no hedging, no superlatives. Sharp and opinionated — take clear positions in active voice, no equivocation. " +
    "Peer-level throughout — eliminate sales language, assume shared context, treat the reader as a capable adult. " +
    "Conversational but constructed — contractions fine, natural rhythm, but every sentence earns its place. " +
    "AUDIENCE: Aspiration-driven, curious and excited at point of contact, moderate-low risk stakes (35/100), strong identity component (72/100). " +
    "Expert-adjacent — don't over-explain. Small decision group, typically founder + product or marketing lead. " +
    "NEVER: Corporate, preachy, salesy, earnest to the point of cringe. " +
    "BANNED WORDS: innovative, cutting-edge, world-class, transform, journey, empower, deliverables, bandwidth, circle back, touch base, move the needle. " +
    "VOCABULARY: 'work' not 'deliverables,' 'people' not 'users,' 'thinking' not 'insights,' 'built' not 'crafted.' " +
    "STYLE: No exclamation points. Oxford comma always. First person plural preferred. Short paragraphs (max 3 sentences). No bullets unless genuinely parallel. Contractions preferred. " +
    "BRAND REFERENCE: Voice markers — 'Most design problems are product problems in disguise.' Direct, specific, willing to name what others soften. Never announces expertise; demonstrates it.",
};
