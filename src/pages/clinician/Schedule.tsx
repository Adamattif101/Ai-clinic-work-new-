import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Appointment } from '../../lib/types';

export default function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>([]);

  useEffect(() => {
    supabase
      .from('appointments')
      .select('id, patient_id, clinician_id, starts_at, ends_at, status')
      .order('starts_at')
      .then(({ data }) => setAppts((data as Appointment[]) ?? []));
  }, []);

  return (
    <div>
      <h1>Schedule</h1>
      <p className="muted">
        Scheduling, reminders, and intake live here. Reminders and billing
        reminders are sent server-side (Stripe metering per session).
      </p>
      <table className="table">
        <thead>
          <tr>
            <th>Starts</th>
            <th>Ends</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appts.map((a) => (
            <tr key={a.id}>
              <td>{new Date(a.starts_at).toLocaleString('en-GB')}</td>
              <td>{new Date(a.ends_at).toLocaleTimeString('en-GB')}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
