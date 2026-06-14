// Shared compliance guardrail (used by Edge Functions AND the React client).
// Wellspring is NOT a medical device: copy and AI output must never imply
// diagnosis, treatment, screening, triage, or condition monitoring.

export const FORBIDDEN_TERMS: RegExp[] = [
  /\btreat(s|ed|ing|ment)?\b/i,
  /\bprevent(s|ed|ing|ion)?\b/i,
  /\bdiagnos(e|es|ed|ing|is|tic)\b/i,
  /\bscreen(s|ed|ing)?\b/i,
  /\btriage(s|d)?\b/i,
  /\bmonitor(s|ed|ing)?\b/i,
  /\bclinical (risk|severity)\b/i,
  /\brisk[-\s]?scor(e|es|ed|ing)\b/i,
  /\bassess(es|ed|ing|ment)? (the )?severity\b/i,
];

export interface ComplianceResult {
  ok: boolean;
  matches: string[];
}

/** Returns the forbidden terms found in `text` (empty array = clean). */
export function checkForbiddenTerms(text: string): ComplianceResult {
  const matches: string[] = [];
  for (const re of FORBIDDEN_TERMS) {
    const m = text.match(re);
    if (m) matches.push(m[0]);
  }
  return { ok: matches.length === 0, matches };
}
