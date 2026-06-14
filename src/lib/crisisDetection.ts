// Deterministic, NON-LLM crisis-detection layer.
//
// This runs in front of ANY free-text chat/journal input in the patient
// companion. It is intentionally a simple, auditable rule set — NOT a model,
// NOT a clinical risk score, and NOT a diagnosis. Its ONLY job is to decide
// whether to SURFACE existing UK helpline signposting. It never gives advice.

export interface CrisisResult {
  flagged: boolean;
  matched: string[];
}

// Phrase patterns indicating a person may be in immediate distress. Word
// boundaries keep matches conservative. This list is reviewed by humans, not
// generated, and is deliberately about signposting — not clinical judgement.
const CRISIS_PATTERNS: RegExp[] = [
  /\bkill myself\b/i,
  /\bkilling myself\b/i,
  /\bend (my|it all|my life)\b/i,
  /\bsuicid(e|al)\b/i,
  /\btake my (own )?life\b/i,
  /\bdon'?t want to (be alive|live|wake up)\b/i,
  /\bwant to die\b/i,
  /\bharm(ing)? myself\b/i,
  /\bself[-\s]?harm(s|ed|ing)?\b/i,
  /\bcut(ting)? myself\b/i,
  /\bno reason to (live|go on)\b/i,
  /\bbetter off (dead|without me)\b/i,
  /\boverdose\b/i,
];

export function detectCrisis(text: string): CrisisResult {
  const matched: string[] = [];
  for (const re of CRISIS_PATTERNS) {
    const m = text.match(re);
    if (m) matched.push(m[0].toLowerCase());
  }
  return { flagged: matched.length > 0, matched };
}

// UK helpline signposting shown when the layer flags. Static, never AI-generated.
export const UK_HELPLINES = {
  samaritans: { name: 'Samaritans', phone: '116 123', note: 'free, 24/7' },
  emergency: { name: 'Emergency services', phone: '999', note: 'if life is at risk' },
  shout: { name: 'Shout', sms: 'Text SHOUT to 85258', note: 'free 24/7 text support' },
} as const;
