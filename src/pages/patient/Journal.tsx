import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { detectCrisis } from '../../lib/crisisDetection';
import { CrisisBanner } from '../../components/CrisisBanner';
import { DEMO_MODE } from '../../lib/demo';

// Journaling with the deterministic, non-LLM crisis layer IN FRONT of the
// free-text input. If a crisis phrase is detected, we surface UK helpline
// signposting before/at save. We never attempt clinical advice.
export default function Journal() {
  const [text, setText] = useState('');
  const [showCrisis, setShowCrisis] = useState(false);
  const [saved, setSaved] = useState(false);

  // Live check as the user types (purely client-side, deterministic).
  const onChange = (value: string) => {
    setText(value);
    setShowCrisis(detectCrisis(value).flagged);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const crisis = detectCrisis(text);
    if (crisis.flagged) setShowCrisis(true);

    if (DEMO_MODE) {
      setSaved(true);
      setText('');
      return;
    }

    const { data: patient } = await supabase
      .from('patients')
      .select('id, clinic_id')
      .limit(1)
      .single();
    if (!patient) return;

    // Results flow to the clinician ONLY with explicit consent; default false.
    await supabase.from('journal_entries').insert({
      clinic_id: patient.clinic_id,
      patient_id: patient.id,
      body: text.trim(),
      crisis_flagged: crisis.flagged,
      shared_with_clinician: false,
    });
    setSaved(true);
    setText('');
  };

  return (
    <div>
      <h1>Journal</h1>
      <p className="muted">A private space to write. Only shared if you choose to.</p>

      {showCrisis && <CrisisBanner />}

      <form className="card" onSubmit={save}>
        <textarea
          rows={8}
          placeholder="Write whatever's on your mind…"
          value={text}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="submit">Save entry</button>
        {saved && <p className="muted">Saved privately.</p>}
      </form>
    </div>
  );
}
