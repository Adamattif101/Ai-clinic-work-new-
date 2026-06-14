import { supabase } from './supabaseClient';
import type { InsightKind, NoteInsight } from './types';

// Calls the server-side notes-to-insight Edge Function with the user's JWT.
// All AI runs server-side under zero-retention terms; the browser never holds
// an AI provider key.
export async function generateInsight(
  patientId: string,
  kind: InsightKind,
): Promise<NoteInsight> {
  const { data, error } = await supabase.functions.invoke('notes-to-insight', {
    body: { patientId, kind },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.insight as NoteInsight;
}
