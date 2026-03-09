// =============================================================================
// VOICE SIDEKICK — ANCHOR LIBRARY
// src/lib/anchorLibrary.js
// =============================================================================
//
// The complete library of 20 personality anchors across 4 categories.
// This is the source of truth for anchor data used in two places:
//   1. The brand setup wizard UI (Phase D) — to display and let admins select
//   2. The prompt construction module — to assemble anchor LLM instructions
//
// Each anchor has three layers:
//   label:          What the admin sees in the setup UI
//   description:    What it means for the brand — shown when the anchor is
//                   selected ("what this means in practice")
//   llmInstruction: The backend instruction passed to Claude at compression
//                   and refinement time — never shown in the UI directly,
//                   but surfaceable as "what this means in practice"
//
// Admins select 3–5 anchors during setup. All three layers of each selected
// anchor are stored on the brand profile object. The llmInstruction fields
// are the core IP of the platform — they are where voice differentiation lives.
// =============================================================================

export const ANCHOR_LIBRARY = {

  emotionalRegister: {
    categoryLabel: "Emotional Register",
    anchors: [
      {
        id: "warm-but-not-soft",
        label: "Warm but Not Soft",
        description:
          "Genuine care and human connection without sentimentality or softening. The warmth shows in how it's said, not in what gets held back.",
        llmInstruction:
          "Write with genuine warmth and human care, but never let it soften your edge or dilute the point. Avoid reassuring filler phrases and sentimental language. The warmth lives in word choice and directness — not in hedging, excessive empathy cues, or emotional cushioning. If a hard truth needs to land, let it land. The warmth is in how you deliver it, not in avoiding it.",
      },
      {
        id: "quietly-confident",
        label: "Quietly Confident",
        description:
          "Authority without volume. Says what it thinks once, clearly. Never oversells, never justifies itself unnecessarily.",
        llmInstruction:
          "Write with deep, understated confidence. State positions directly and without hedging. Never use superlatives, hyperbole, or self-promotional framing. The confidence is in the precision of the language, not its volume. Do not over-explain or pre-emptively defend claims — let the substance carry the authority. Avoid phrases that seek validation or signal uncertainty ('we believe,' 'we think,' 'hopefully,' 'in our opinion').",
      },
      {
        id: "electric",
        label: "Electric",
        description:
          "Writing that feels alive and kinetic. Energy comes from specificity and rhythm, not exclamation points or hype.",
        llmInstruction:
          "Writing should feel alive, forward-moving, and kinetic. Vary sentence length deliberately to create rhythm — short punchy sentences drive momentum; longer ones develop ideas. Word choice must be vivid and specific. Avoid passive constructions, flat transitions, and abstract nouns where concrete ones exist. The energy comes from specificity and movement, never from exclamation points or intensifiers.",
      },
      {
        id: "irreverent-but-informed",
        label: "Irreverent but Informed",
        description:
          "Challenges conventions and comfortable phrasing, but backs every claim with substance. The provocation is in the angle, not the absence of rigor.",
        llmInstruction:
          "Challenge conventions, conventional phrasing, and industry clichés directly. Take unexpected angles. Be willing to say what others soften or avoid. But back every claim with substance and specificity — irreverence without information is just noise. The provocation is in the perspective and framing, not in the absence of accuracy. Never sacrifice correctness for contrarianism.",
      },
      {
        id: "grounded",
        label: "Grounded",
        description:
          "Stays close to the concrete and real. Language is practical and immediate. No flights of rhetoric.",
        llmInstruction:
          "Stay close to the concrete, the immediate, and the real. Avoid abstraction where specific language exists. Metaphors, if used, are drawn from everyday life and physical reality — not from the language of innovation or strategy. Language is practical, purposeful, and rooted. Resist the pull toward grand framing or sweeping claims.",
      },
      {
        id: "provocative",
        label: "Provocative",
        description:
          "Makes bold claims and uncomfortable observations. Names what others avoid. The discomfort is intentional.",
        llmInstruction:
          "Make bold, specific claims. Name uncomfortable truths directly. Challenge assumptions that the audience holds but hasn't examined. Do not soften points that are meant to land hard. Be willing to make the reader slightly uncomfortable in service of a real insight. Provocations must be grounded in substance — not contrarianism for its own sake.",
      },
    ],
  },

  intellectualPosture: {
    categoryLabel: "Intellectual Posture",
    anchors: [
      {
        id: "teach-without-lecturing",
        label: "Teach Without Lecturing",
        description:
          "Shares knowledge in a way that respects the reader's intelligence. Explains by showing, not telling. Never condescending.",
        llmInstruction:
          "Share knowledge in ways that treat the reader as intelligent and capable. Explain by showing — examples, specifics, concrete details — not by announcing that you're explaining. Avoid condescending setup phrases ('Simply put,' 'In other words,' 'Let me explain'). Let the idea emerge from the example rather than declaring it first. Trust the reader to make the connection.",
      },
      {
        id: "sharp-and-opinionated",
        label: "Sharp and Opinionated",
        description:
          "Takes clear positions. No equivocation. Knows what it thinks and says so without hiding behind passive constructions.",
        llmInstruction:
          "Take clear, specific positions. No both-sidesing, no mealy-mouthed equivocation, no 'it depends' as a final answer. The writing knows what it thinks and says so in active voice. Opinions are stated as such — directly and attributed clearly ('We think,' 'The answer is,' 'This approach doesn't work'). Do not hide positions in passive constructions or bury them in qualifications.",
      },
      {
        id: "precision-over-flash",
        label: "Precision Over Flash",
        description:
          "The exact right word over the impressive one. Technical accuracy over rhetorical flair. Spare prose.",
        llmInstruction:
          "Choose the most precise word over the most impressive one. Technical accuracy is the priority over rhetorical flair. Spare, exact prose — no decorative language, no flourishes for their own sake. If a technical term is genuinely the most precise option, use it without over-explaining. If plain language is more precise, use that. Never use a longer or more complex word when a shorter, more accurate one exists.",
      },
      {
        id: "curious-and-exploratory",
        label: "Curious and Exploratory",
        description:
          "Writing feels like genuine inquiry. Openness to complexity. Willing to surface tension without resolving it artificially.",
        llmInstruction:
          "Write with genuine curiosity — the sense that ideas are being worked through in real time, not delivered from a completed conclusion. Surface complexity and tension without forcing artificial resolution. Questions, when they appear, should be real questions rather than rhetorical devices. The writing is open to nuance and willing to say 'it's more complicated than that' without abandoning clarity.",
      },
      {
        id: "complexity-made-effortless",
        label: "Complexity Made Effortless",
        description:
          "Handles genuinely complex material without dumbing it down or overwhelming. The structure does the work.",
        llmInstruction:
          "Handle complex material without simplifying it into inaccuracy or overwhelming with density. The structure carries the reader — sequencing, paragraph breaks, and sentence length do the cognitive work. Each idea gets exactly the space it needs, no more. The goal is not to make things seem simple but to make them feel effortless to follow.",
      },
    ],
  },

  relationshipPosture: {
    categoryLabel: "Relationship Posture",
    anchors: [
      {
        id: "peer-not-vendor",
        label: "Peer Not Vendor",
        description:
          "Writes as if to an equal, not a buyer. No sales register. Assumes shared context and intelligence.",
        llmInstruction:
          "Write as if to a peer — someone at the same level, with shared context and comparable intelligence. Eliminate sales register entirely: no CTAs that assume the reader needs convincing, no features-and-benefits framing, no over-explanation of obvious stakes. Use 'we' and 'you' as collaborators working on the same problem, not as brand and customer. Assume the reader already understands the stakes.",
      },
      {
        id: "trusted-authority",
        label: "Trusted Authority",
        description:
          "Expertise is assumed, not performed. Prescriptive when prescriptions are warranted. Authority is in the content, not the claim.",
        llmInstruction:
          "The brand has earned its expertise and does not need to announce it. Write with the natural authority of someone who has already done the work and is sharing conclusions. Be prescriptive when the situation calls for a clear recommendation. Do not over-qualify or seek permission to hold a position. Authority lives in the specificity of the content — not in credentialing language ('As experts in...' or 'With years of experience...').",
      },
      {
        id: "behind-the-curtain",
        label: "Behind the Curtain",
        description:
          "Shows process, thinking, and even uncertainty. Transparency builds trust. Doesn't perform competence — demonstrates it.",
        llmInstruction:
          "Show the thinking, not just the conclusion. Be willing to reveal process, acknowledge complexity, and surface genuine uncertainty where it exists. Do not perform competence — demonstrate it by showing the work. Transparency about limitations or tradeoffs builds more trust than flawless presentation. The writing invites the reader into the real story, not the polished version of it.",
      },
      {
        id: "generous-guide",
        label: "Generous Guide",
        description:
          "Genuinely invested in the reader's success. Writing gives more than it needs to. Proactively addresses what comes next.",
        llmInstruction:
          "Write as if genuinely invested in what happens after the reader finishes reading. Give more than is strictly required — proactively address the next question, the edge case, the thing the reader didn't know to ask. No information hoarding, no artificial scarcity of insight. The reader should finish feeling ahead, not just informed.",
      },
      {
        id: "challenger",
        label: "Challenger",
        description:
          "Willing to name the problem the reader is avoiding. Pushes back on comfortable assumptions in service of the reader.",
        llmInstruction:
          "Name the thing the reader is avoiding or hasn't examined. Challenge comfortable assumptions and conventional approaches directly. The discomfort is in service of the reader — not provocative for its own sake, but because the real problem is usually not the one they came in with. Push back, ask harder questions, and reframe when the framing itself is the issue.",
      },
    ],
  },

  craftAndStyle: {
    categoryLabel: "Craft & Style",
    anchors: [
      {
        id: "tight-and-muscular",
        label: "Tight and Muscular",
        description:
          "Every word earns its place. Lean, strong sentences. Active voice. Short paragraphs. No filler.",
        llmInstruction:
          "Every word must earn its place. Cut filler, padding, and any sentence that doesn't pull weight. Lean, active constructions — subject, verb, object. Short paragraphs with clear purpose. No throat-clearing openers. No summary sentences that restate what was just said. Active voice by default. If a word can be removed without changing meaning, remove it.",
      },
      {
        id: "rich-and-textured",
        label: "Rich and Textured",
        description:
          "Writing has depth and layers. Imagery is specific and earned. Ideas are developed, not gestured at.",
        llmInstruction:
          "Writing should have depth and dimensionality — not density. Imagery is specific and earned, not decorative. Ideas are developed fully rather than gestured at and moved on from. Take space when the content demands it and use that space with craft — varied sentence structure, deliberate rhythm, specific concrete detail. The texture comes from substance, not ornamentation.",
      },
      {
        id: "conversational-with-craft",
        label: "Conversational with Craft",
        description:
          "Sounds like a very smart person talking. Natural rhythm, informal where appropriate, but every sentence is still precise and intentional.",
        llmInstruction:
          "Write in the register of a very intelligent person speaking — natural rhythm, contractions where they feel right, informal transitions that don't sound like formal essay prose. But 'conversational' does not mean loose or imprecise. Every sentence is still carefully constructed. The informality is tonal, not structural — it sounds effortless because the craft is invisible, not absent.",
      },
      {
        id: "clean-and-modern",
        label: "Clean and Modern",
        description:
          "No unnecessary flourishes. Contemporary without being trendy. Formatting serves clarity.",
        llmInstruction:
          "No unnecessary flourishes, ornamentation, or rhetorical decoration. Contemporary register — not archaic, not overly casual, not trendy. Formatting serves clarity, never performance. Short sentences preferred. Transitions are functional. The writing reads as if written now, by someone who values clarity over cleverness.",
      },
      {
        id: "storytelling-first",
        label: "Storytelling-First",
        description:
          "Every piece of content has a narrative arc, even short copy. Concrete scene-setting. The reader is always located somewhere.",
        llmInstruction:
          "Every piece of content — even short copy — should have a narrative shape: a beginning that locates the reader, a middle that develops something, an end that resolves or opens something. Concrete scene-setting and specific detail are preferred over abstract framing. The reader should feel placed in a moment or situation, not floating in abstraction. Even a product description can tell a small story.",
      },
    ],
  },
};

// Flat array of all anchors — useful for lookup by id without knowing category
export const ALL_ANCHORS = Object.values(ANCHOR_LIBRARY).flatMap(
  (category) => category.anchors.map((anchor) => ({
    ...anchor,
    category: Object.keys(ANCHOR_LIBRARY).find(
      (key) => ANCHOR_LIBRARY[key] === category
    ),
  }))
);

// Look up a single anchor by id — returns anchor object with category key attached
export function getAnchorById(id) {
  return ALL_ANCHORS.find((anchor) => anchor.id === id) || null;
}

