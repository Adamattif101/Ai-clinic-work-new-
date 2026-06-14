import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Patient } from '../../lib/types';
import { DEMO_MODE, demoPatients } from '../../lib/demo';

export default function Clients() {
  const [patients, setPatients] = useState<Patient[]>(DEMO_MODE ? demoPatients : []);

  useEffect(() => {
    if (DEMO_MODE) return;
    supabase
      .from('patients')
      .select('id, clinic_id, full_name, email, status, primary_clinician_id')
      .order('full_name')
      .then(({ data }) => setPatients((data as Patient[]) ?? []));
  }, []);

  return (
    <div>
      <h1>Clients</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id}>
              <td>{p.full_name}</td>
              <td>{p.email}</td>
              <td>{p.status}</td>
              <td>
                <Link to={`/clients/${p.id}`}>Open</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
