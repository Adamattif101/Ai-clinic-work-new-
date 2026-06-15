import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { DEMO_MODE, demoChapters } from '../../lib/demo';

// Therapist-assigned homework: fixed psychoeducation content the patient
// navigates like book chapters. STUB.
interface Chapter {
  id: string;
  title: string;
  body: string;
  ordinal: number;
}

export default function Homework() {
  const [chapters, setChapters] = useState<Chapter[]>(DEMO_MODE ? demoChapters : []);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (DEMO_MODE) return;
    supabase
      .from('psychoed_content')
      .select('id, title, body, ordinal')
      .order('ordinal')
      .then(({ data }) => setChapters((data as Chapter[]) ?? []));
  }, []);

  return (
    <div>
      <h1>Your exercises</h1>
      <p className="muted">Fixed reading and exercises assigned by your therapist.</p>
      {chapters.map((c) => (
        <div className="card" key={c.id}>
          <button className="chapter-head" onClick={() => setOpen(open === c.id ? null : c.id)}>
            {c.ordinal}. {c.title}
          </button>
          {open === c.id && <p>{c.body}</p>}
        </div>
      ))}
    </div>
  );
}
