import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/auth';

// Compliance settings: the clinic (data controller) manages DPA acceptance,
// data region, retention, and data export here.
export default function Settings() {
  const { profile } = useAuth();
  const [clinic, setClinic] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('clinics')
      .select('*')
      .eq('id', profile.clinic_id)
      .single()
      .then(({ data }) => setClinic(data));
  }, [profile]);

  const acceptDpa = async () => {
    if (!clinic) return;
    setSaving(true);
    await supabase
      .from('clinics')
      .update({
        dpa_version: '1.0',
        dpa_accepted_at: new Date().toISOString(),
        dpa_accepted_by: profile?.id,
      })
      .eq('id', clinic.id);
    const { data } = await supabase.from('clinics').select('*').eq('id', clinic.id).single();
    setClinic(data);
    setSaving(false);
  };

  const exportData = async () => {
    // Server-side admin job assembles a GDPR export; here we trigger it.
    const { data, error } = await supabase.functions.invoke('data-export', {
      body: { clinicId: clinic?.id },
    });
    if (error) alert(error.message);
    else alert(`Export queued: ${data?.status ?? 'ok'}`);
  };

  if (!clinic) return <p>Loading settings…</p>;

  return (
    <div>
      <h1>Clinic settings &amp; compliance</h1>

      <section className="card">
        <h2>Data Processing Agreement</h2>
        <p className="muted">
          Your clinic is the <strong>data controller</strong>; Wellspring is the
          <strong> data processor</strong>.
        </p>
        {clinic.dpa_accepted_at ? (
          <p>DPA v{clinic.dpa_version} accepted on {new Date(clinic.dpa_accepted_at).toLocaleDateString('en-GB')}.</p>
        ) : (
          <button onClick={acceptDpa} disabled={saving}>
            {saving ? 'Saving…' : 'Accept DPA v1.0'}
          </button>
        )}
      </section>

      <section className="card">
        <h2>Data residency &amp; retention</h2>
        <p>Region: <strong>{clinic.data_region?.toUpperCase()}</strong> (UK/EU).</p>
        <p>Retention: <strong>{clinic.retention_days}</strong> days (configurable).</p>
      </section>

      <section className="card">
        <h2>Data export</h2>
        <p className="muted">Download a GDPR-compliant export of this clinic's records.</p>
        <button onClick={exportData}>Request data export</button>
      </section>
    </div>
  );
}
