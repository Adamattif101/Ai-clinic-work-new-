// Demo showcase data. When DEMO_MODE is on, the app renders this sample content
// (no Supabase / login needed) so potential clinics can see what Wellspring does.
// Flip DEMO_MODE to false to run the real, authenticated app.
import type {
  Appointment,
  NoteInsight,
  Patient,
  SessionNote,
} from './types';

export const DEMO_MODE = true;

const CLINIC = '11111111-1111-1111-1111-111111111111';

export const demoPatients: Patient[] = [
  { id: 'p1', clinic_id: CLINIC, full_name: 'Alex Morgan', email: 'alex@example.com', status: 'active', primary_clinician_id: 'c1' },
  { id: 'p2', clinic_id: CLINIC, full_name: 'Jordan Lee', email: 'jordan@example.com', status: 'active', primary_clinician_id: 'c2' },
  { id: 'p3', clinic_id: CLINIC, full_name: 'Sam Patel', email: 'sam@example.com', status: 'active', primary_clinician_id: 'c2' },
  { id: 'p4', clinic_id: CLINIC, full_name: 'Priya Nair', email: 'priya@example.com', status: 'active', primary_clinician_id: 'c1' },
  { id: 'p5', clinic_id: CLINIC, full_name: 'Tom Bryant', email: 'tom@example.com', status: 'paused', primary_clinician_id: 'c1' },
];

const today = new Date();
const day = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString();
};
const dateStr = (offset: number) => day(offset).slice(0, 10);

export const demoAppointments: Appointment[] = [
  { id: 'a1', patient_id: 'p1', clinician_id: 'c1', starts_at: day(1), ends_at: day(1), status: 'scheduled' },
  { id: 'a2', patient_id: 'p2', clinician_id: 'c2', starts_at: day(2), ends_at: day(2), status: 'scheduled' },
  { id: 'a3', patient_id: 'p3', clinician_id: 'c2', starts_at: day(-2), ends_at: day(-2), status: 'no_show' },
  { id: 'a4', patient_id: 'p4', clinician_id: 'c1', starts_at: day(-7), ends_at: day(-7), status: 'completed' },
  { id: 'a5', patient_id: 'p1', clinician_id: 'c1', starts_at: day(-7), ends_at: day(-7), status: 'completed' },
  { id: 'a6', patient_id: 'p2', clinician_id: 'c2', starts_at: day(3), ends_at: day(3), status: 'scheduled' },
];

export const demoNotesByPatient: Record<string, SessionNote[]> = {
  p1: [
    { id: 'n2', patient_id: 'p1', clinician_id: 'c1', session_date: dateStr(-1),
      body: 'Client engaged well. Boundary conversation with sibling went better than expected. Still finds mornings hard. Wants to focus next on work stress. Agreed to try a wind-down routine.' },
    { id: 'n1', patient_id: 'p1', clinician_id: 'c1', session_date: dateStr(-8),
      body: 'Client reported a steadier week. Used the breathing exercise before two work meetings and found it helped. Sleep still irregular. We revisited goals around boundary-setting with family. Homework: continue daily check-ins, read chapter on values.' },
  ],
  p2: [
    { id: 'n3', patient_id: 'p2', clinician_id: 'c2', session_date: dateStr(-3),
      body: 'Discussed recent presentation at work which went well. Confidence building. Noted some avoidance around social plans. Agreed a small step: accept one invitation this week.' },
  ],
  p3: [
    { id: 'n4', patient_id: 'p3', clinician_id: 'c2', session_date: dateStr(-5),
      body: 'Reviewed journaling from the week. Identified a recurring evening slump. Explored values around creativity. Client keen on the wind-down routine exercise.' },
  ],
};

// A pre-generated example of the notes-to-insight output, shown when the demo
// user clicks "Client summary" — illustrates the feature without an API call.
export const demoInsight = (patientId: string): NoteInsight => ({
  id: 'demo-insight',
  patient_id: patientId,
  kind: 'treatment_summary',
  model: 'claude (demo)',
  generated_at: new Date().toISOString(),
  reviewed_at: null,
  content: {
    text: [
      'Focus areas',
      '• Boundary-setting with family, and managing work-related stress.',
      '• Building a consistent morning and wind-down routine.',
      '',
      'Approaches the clinician noted',
      '• Breathing exercise used before high-pressure work meetings.',
      '• Values-based reflection and graded behavioural steps.',
      '',
      'Client-reported engagement',
      '• Steadier week overall; boundary conversation went better than expected.',
      '• Mornings still reported as difficult; sleep irregular.',
      '',
      'Agreed next steps',
      '• Continue daily wellbeing check-ins.',
      '• Try the wind-down routine; read the chapter on values.',
      '',
      'Draft generated from your notes for review — not clinical advice.',
    ].join('\n'),
  },
});

export const demoStats = {
  caseload: demoPatients.filter((p) => p.status === 'active').length,
  upcoming: demoAppointments.filter((a) => a.status === 'scheduled').length,
  noShowRate: 17,
  avgMood: 3.6,
};

export const demoMoodTrend = [3, 4, 3, 4, 5, 4]; // last 6 check-ins (engagement)

export const demoChapters = [
  { id: 'ch1', title: 'Understanding Values', ordinal: 1,
    body: 'A short reflection on identifying what matters most to you, and using those values to guide small daily choices.' },
  { id: 'ch2', title: 'A Simple Wind-Down Routine', ordinal: 2,
    body: 'A gentle evening routine to help you switch off: dimming lights, a brief breathing exercise, and a two-line journal.' },
  { id: 'ch3', title: 'Noticing Thinking Traps', ordinal: 3,
    body: 'Psychoeducation on common unhelpful thinking patterns and a worksheet to spot them in everyday situations.' },
];

export const demoClinic = {
  name: 'Edgbaston Wellbeing Practice',
  data_region: 'uk',
  retention_days: 2555,
  dpa_version: '1.0',
  dpa_accepted_at: new Date().toISOString(),
};
