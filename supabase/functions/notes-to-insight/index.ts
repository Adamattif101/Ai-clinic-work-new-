// notes-to-insight Edge Function
// Server-side ONLY. Generates an administrative summary / "what changed" recap /
// pre-session prep brief from clinician-authored notes, using Claude under
// zero-retention terms. The AI reorganises text the clinician already wrote; it
// never diagnoses, triages, scores, or recommends care.
//
// Auth: requires a valid user JWT (verify_jwt = true). We re-read clinic_id from
// the JWT and use the user's token for DB reads so RLS enforces tenant isolation.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { checkForbiddenTerms } from '../_shared/forbiddenTerms.ts';

type InsightKind = 'treatment_summary' | 'whats_changed' | 'prep_brief';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const ANTHROPIC_MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-sonnet-4-6';

// System prompt encodes the not-a-medical-device boundary.
const SYSTEM_PROMPT = `You are an administrative drafting aid for a UK therapy clinic.
You ONLY reorganise and summarise notes the clinician has already written.
You are NOT a medical device and must NEVER:
- diagnose, screen, triage, risk-score, or assess clinical severity;
- recommend, change, prevent, or "treat" any condition or care plan;
- infer new clinical facts the clinician did not write;
- use the words treat, prevent, diagnose, screen, triage, or monitor a condition.
Frame everything as engagement and administrative support. Write plainly and concisely.
If asked for anything clinical, decline and restate your administrative purpose.`;

const KIND_INSTRUCTIONS: Record<InsightKind, string> = {
  treatment_summary:
    'Produce a structured per-client summary of the clinician\'s notes with sections: Focus areas, Approaches the clinician noted, Client-reported engagement, Agreed next steps. Use only what is in the notes.',
  whats_changed:
    'Compare the most recent note with the previous one and produce a short "what changed since last session" recap: New developments, Continued themes, Agreed next steps. Use only what is in the notes.',
  prep_brief:
    'Produce a one-screen pre-session prep brief for the clinician: Where things were left, Open threads to revisit, Logistics/homework to follow up. Use only what is in the notes.',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { patientId, kind } = (await req.json()) as {
      patientId: string;
      kind: InsightKind;
    };
    if (!patientId || !KIND_INSTRUCTIONS[kind]) {
      return json({ error: 'patientId and a valid kind are required' }, 400);
    }

    // RLS ensures we only read notes from the caller's clinic + permitted patient.
    const { data: notes, error } = await supabase
      .from('session_notes')
      .select('id, body, session_date, clinic_id')
      .eq('patient_id', patientId)
      .order('session_date', { ascending: false })
      .limit(kind === 'whats_changed' ? 2 : 8);

    if (error) return json({ error: error.message }, 403);
    if (!notes || notes.length === 0) return json({ error: 'No notes found' }, 404);

    const notesText = notes
      .map((n) => `--- Session ${n.session_date} ---\n${n.body}`)
      .join('\n\n');

    const aiResponse = await callClaude(KIND_INSTRUCTIONS[kind], notesText);

    // Post-filter: block any output that drifts toward clinical/medical-device language.
    const compliance = checkForbiddenTerms(aiResponse);
    if (!compliance.ok) {
      return json(
        {
          error: 'Generated draft was withheld by the compliance filter.',
          flaggedTerms: compliance.matches,
        },
        422,
      );
    }

    // Persist as a draft for clinician review (clinic_id from the source notes).
    const clinicId = notes[0].clinic_id;
    const { data: inserted, error: insErr } = await supabase
      .from('note_insights')
      .insert({
        clinic_id: clinicId,
        patient_id: patientId,
        source_note_id: notes[0].id,
        kind,
        content: { text: aiResponse },
        model: ANTHROPIC_MODEL,
      })
      .select()
      .single();

    if (insErr) return json({ error: insErr.message }, 403);
    return json({ insight: inserted });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

async function callClaude(instruction: string, notesText: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${instruction}\n\nClinician notes:\n${notesText}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Claude API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return (data.content ?? []).map((b: { text?: string }) => b.text ?? '').join('').trim();
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
