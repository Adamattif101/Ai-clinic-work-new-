import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

// Owner dashboard: caseload, utilisation, no-show rate, and self-reported
// wellbeing engagement trends. Framed as ENGAGEMENT, not clinical severity.
interface Stats {
  caseload: number;
  upcoming: number;
  noShowRate: number;
  avgMood: number | null;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const [{ count: caseload }, appts, checkins] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('appointments').select('status, starts_at'),
        supabase.from('wellbeing_checkins').select('mood'),
      ]);

      const rows = appts.data ?? [];
      const completedOrNoShow = rows.filter((r) => ['completed', 'no_show'].includes(r.status));
      const noShows = rows.filter((r) => r.status === 'no_show').length;
      const upcoming = rows.filter(
        (r) => r.status === 'scheduled' && new Date(r.starts_at) > new Date(),
      ).length;
      const moods = (checkins.data ?? []).map((c) => c.mood).filter((m): m is number => m != null);

      setStats({
        caseload: caseload ?? 0,
        upcoming,
        noShowRate: completedOrNoShow.length
          ? Math.round((noShows / completedOrNoShow.length) * 100)
          : 0,
        avgMood: moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : null,
      });
    })();
  }, []);

  if (!stats) return <p>Loading dashboard…</p>;

  return (
    <div>
      <h1>Owner dashboard</h1>
      <p className="muted">
        Engagement and utilisation overview. These are operational signals, not
        clinical measures.
      </p>
      <div className="stat-grid">
        <Stat label="Active caseload" value={stats.caseload} />
        <Stat label="Upcoming appointments" value={stats.upcoming} />
        <Stat label="No-show rate" value={`${stats.noShowRate}%`} />
        <Stat
          label="Avg. wellbeing check-in (1–5)"
          value={stats.avgMood ? stats.avgMood.toFixed(1) : '—'}
          hint="Self-reported engagement, not a clinical scale"
        />
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
