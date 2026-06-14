import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { generateInsight } from '../../lib/api';
import type { InsightKind, NoteInsight, Patient, SessionNote } from '../../lib/types';

// The notes-to-insight layer (clinician side). Clinician pastes/types notes;
// the AI produces an administrative draft they review and own.
const KINDS: { kind: InsightKind; label: string; blurb: string }[] = [
  { kind: 'treatment_summary', label: 'Client summary', blurb: 'Structured per-client summary of your notes' },
  { kind: 'whats_changed', label: 'What changed', blurb: 'Recap since the previous session' },
  { kind: 'prep_brief', label: 'Prep brief', blurb: 'Pre-session prep, one screen' },
];

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [draft, setDraft] = useState('');
  const [insight, setInsight] = useState<NoteInsight | null>(null);
  const [busy, setBusy] = useState<InsightKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    const [{ data: p }, { data: n }] = await Promise.all([
      supabase.from('patients').select('*').eq('id', id).single(),
      supabase
        .from('session_notes')
        .select('id, patient_id, clinician_id, body, session_date')
        .eq('patient_id', id)
        .order('session_date', { ascending: false }),
    ]);
    setPatient((p as Patient) ?? null);
    setNotes((n as SessionNote[]) ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !draft.trim()) return;
    const { data: prof } = await supabase.auth.getUser();
    const { error } = await supabase.from('session_notes').insert({
      // clinic_id is set from the patient row to satisfy RLS check.
      clinic_id: patient?.clinic_id,
      patient_id: id,
      clinician_id: prof.user?.id,
      body: draft.trim(),
    });
    if (error) setError(error.message);
    else {
      setDraft('');
      load();
    }
  };

  const run = async (kind: InsightKind) => {
    if (!id) return;
    setBusy(kind);
    setError(null);
    try {
      const result = await generateInsight(id, kind);
      setInsight(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  if (!patient) return <p>Loading…</p>;

  return (
    <div className="client-detail">
      <h1>{patient.full_name}</h1>

      <section className="card">
        <h2>Add session note</h2>
        <form onSubmit={saveNote}>
          <textarea
            rows={5}
            placeholder="Type or paste your session notes…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit">Save note</button>
        </form>
      </section>

      <section className="card">
        <h2>Generate insight</h2>
        <p className="muted">
          Reorganises notes you wrote into an administrative draft. Review before
          use — it is a drafting aid, not clinical advice.
        </p>
        <div className="kind-row">
          {KINDS.map((k) => (
            <button key={k.kind} disabled={busy !== null} onClick={() => run(k.kind)} title={k.blurb}>
              {busy === k.kind ? 'Generating…' : k.label}
            </button>
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        {insight && (
          <article className="insight">
            <div className="muted">
              {insight.kind} · {insight.model} · draft for review
            </div>
            <pre className="insight-text">{insight.content.text}</pre>
          </article>
        )}
      </section>

      <section className="card">
        <h2>Session notes</h2>
        <ul className="notes-list">
          {notes.map((n) => (
            <li key={n.id}>
              <strong>{n.session_date}</strong>
              <p>{n.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
