import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/auth';

// Patient wellbeing companion (clinic-branded). STUB.
// Daily self-reported mood check-in (1–5). This is engagement, NOT clinical
// symptom tracking, and is framed accordingly.
const MOODS = [
  { v: 1, label: 'Very low' },
  { v: 2, label: 'Low' },
  { v: 3, label: 'OK' },
  { v: 4, label: 'Good' },
  { v: 5, label: 'Great' },
];

export default function CompanionHome() {
  const { profile } = useAuth();
  const [saved, setSaved] = useState(false);

  const checkin = async (mood: number) => {
    // patient_id resolution would map auth user -> patients row; stubbed via RLS.
    const { data: patient } = await supabase
      .from('patients')
      .select('id, clinic_id')
      .limit(1)
      .single();
    if (!patient) return;
    await supabase.from('wellbeing_checkins').insert({
      clinic_id: patient.clinic_id,
      patient_id: patient.id,
      mood,
    });
    setSaved(true);
  };

  return (
    <div>
      <h1>Hello{profile?.full_name ? `, ${profile.full_name}` : ''}</h1>
      <p className="muted">A space to check in and reflect. This is not medical care.</p>

      <section className="card">
        <h2>How are you feeling today?</h2>
        <div className="mood-row">
          {MOODS.map((m) => (
            <button key={m.v} onClick={() => checkin(m.v)} className="mood-btn">
              {m.label}
            </button>
          ))}
        </div>
        {saved && <p className="muted">Thanks — your check-in was saved.</p>}
      </section>

      <p className="disclaimer">
        Wellspring is a wellbeing companion, not a medical device. It does not
        diagnose or provide clinical care. In an emergency call 999, or
        Samaritans on 116 123.
      </p>
    </div>
  );
}
