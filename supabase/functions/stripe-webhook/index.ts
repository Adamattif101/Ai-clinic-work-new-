// stripe-webhook Edge Function (STUB).
// Handles per-clinic subscription + per-session metering events. Verifies the
// Stripe signature (verify_jwt = false; auth is via the signature instead).
// Uses the service-role key — server-only — to update billing rows across RLS.

import Stripe from 'npm:stripe@16';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

// Service-role client: admin job only. Never exposed to the browser.
const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  if (!signature) return new Response('Missing signature', { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    return new Response(`Webhook signature error: ${err}`, { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription;
      const clinicId = sub.metadata.clinic_id;
      if (clinicId) {
        await admin.from('billing_accounts').upsert({
          clinic_id: clinicId,
          stripe_customer_id: String(sub.customer),
          stripe_subscription_id: sub.id,
          seats: sub.items.data[0]?.quantity ?? 1,
          updated_at: new Date().toISOString(),
        });
      }
      break;
    }
    case 'invoice.payment_failed': {
      // Trigger a billing reminder (handled by a separate notification job).
      break;
    }
    default:
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
