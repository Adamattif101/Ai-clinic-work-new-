import { describe, it, expect } from 'vitest';
import { detectCrisis } from '../src/lib/crisisDetection';

describe('detectCrisis (deterministic, non-LLM)', () => {
  it('flags clear crisis phrases', () => {
    expect(detectCrisis('I want to kill myself').flagged).toBe(true);
    expect(detectCrisis('thinking about suicide lately').flagged).toBe(true);
    expect(detectCrisis('I have been self-harming').flagged).toBe(true);
  });

  it('does not flag ordinary low-mood text', () => {
    expect(detectCrisis('I had a tiring week and felt a bit flat').flagged).toBe(false);
    expect(detectCrisis('work was stressful but the breathing exercise helped').flagged).toBe(false);
  });

  it('returns the matched phrases for auditability', () => {
    const r = detectCrisis('I want to die');
    expect(r.flagged).toBe(true);
    expect(r.matched).toContain('want to die');
  });
});
