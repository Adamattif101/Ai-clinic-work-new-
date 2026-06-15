import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Appointment } from '../../lib/types';
import { DEMO_MODE, demoAppointments, demoPatients } from '../../lib/demo';

export default function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(DEMO_MODE ? demoAppointments : []);

  useEffect(() => {
    if (DEMO_MODE) return;
    supabase
      .from('appointments')
      .select('id, patient_id, clinician_id, starts_at, ends_at, status')
      .order('starts_at')
      .then(({ data }) => setAppts((data as Appointment[]) ?? []));
  }, []);

  const nameFor = (pid: string) =>
    demoPatients.find((p) => p.id === pid)?.full_name ?? '—';

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
            {DEMO_MODE && <th>Client</th>}
            <th>When</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appts.map((a) => (
            <tr key={a.id}>
              {DEMO_MODE && <td>{nameFor(a.patient_id)}</td>}
              <td>{new Date(a.starts_at).toLocaleString('en-GB')}</td>
              <td>
                <span className={`badge${a.status === 'no_show' ? ' warn' : ''}`}>
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
