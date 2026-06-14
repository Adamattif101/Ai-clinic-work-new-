// Client-side copy of the compliance guardrail. Mirrors
// supabase/functions/_shared/forbiddenTerms.ts so UI copy and any free-text the
// app renders can be checked against the not-a-medical-device boundary.

export const FORBIDDEN_TERMS: RegExp[] = [
  /\btreat(s|ed|ing|ment)?\b/i,
  /\bprevent(s|ed|ing|ion)?\b/i,
  /\bdiagnos(e|es|ed|ing|is|tic)\b/i,
  /\bscreen(s|ed|ing)?\b/i,
  /\btriage(s|d)?\b/i,
  /\bmonitor(s|ed|ing)?\b/i,
  /\bclinical (risk|severity)\b/i,
  /\brisk[-\s]?scor(e|es|ed|ing)\b/i,
];

export function checkForbiddenTerms(text: string): { ok: boolean; matches: string[] } {
  const matches: string[] = [];
  for (const re of FORBIDDEN_TERMS) {
    const m = text.match(re);
    if (m) matches.push(m[0]);
  }
  return { ok: matches.length === 0, matches };
}
