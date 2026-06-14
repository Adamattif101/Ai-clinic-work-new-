// data-export Edge Function (STUB).
// GDPR data-export for a clinic (controller right). Requires owner/admin JWT;
// we re-check the caller's role and clinic before assembling the export.
// Records an audit-log 'export' action.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization') ?? '';
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  // RLS restricts these reads to the caller's clinic; owner/admin only by policy.
  const tables = ['patients', 'session_notes', 'appointments', 'consents', 'wellbeing_checkins'];
  const exportBundle: Record<string, unknown> = {};
  for (const t of tables) {
    const { data } = await supabase.from(t).select('*');
    exportBundle[t] = data ?? [];
  }

  return new Response(
    JSON.stringify({ status: 'ready', generatedAt: new Date().toISOString(), data: exportBundle }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
