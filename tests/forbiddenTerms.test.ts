import { describe, it, expect } from 'vitest';
import { checkForbiddenTerms } from '../src/lib/forbiddenTerms';

describe('checkForbiddenTerms (not-a-medical-device guardrail)', () => {
  it('flags medical-device language', () => {
    expect(checkForbiddenTerms('we will diagnose and treat you').ok).toBe(false);
    expect(checkForbiddenTerms('monitor your depression').ok).toBe(false);
    expect(checkForbiddenTerms('screen for anxiety').ok).toBe(false);
  });

  it('passes compliant wellbeing language', () => {
    expect(checkForbiddenTerms('a summary of your session notes and engagement').ok).toBe(true);
  });
});
