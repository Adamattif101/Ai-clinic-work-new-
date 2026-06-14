export type UserRole = 'owner' | 'clinician' | 'admin' | 'patient';

export interface Profile {
  id: string;
  clinic_id: string;
  role: UserRole;
  full_name: string | null;
  email: string | null;
}

export interface Patient {
  id: string;
  clinic_id: string;
  full_name: string;
  email: string | null;
  status: string;
  primary_clinician_id: string | null;
}

export interface SessionNote {
  id: string;
  patient_id: string;
  clinician_id: string;
  body: string;
  session_date: string;
}

export type InsightKind = 'treatment_summary' | 'whats_changed' | 'prep_brief';

export interface NoteInsight {
  id: string;
  patient_id: string;
  kind: InsightKind;
  content: { text: string };
  model: string | null;
  generated_at: string;
  reviewed_at: string | null;
}

export interface Appointment {
  id: string;
  patient_id: string;
  clinician_id: string;
  starts_at: string;
  ends_at: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
}
