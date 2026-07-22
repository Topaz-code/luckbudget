import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { corsHeaders, jsonResponse } from '../_shared/http.ts';
import { webhookSecret } from '../_shared/monnify.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const bytesToHex = (bytes: Uint8Array): string =>
  [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');

const hmac = async (body: Uint8Array): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(webhookSecret()),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );
  const message = new Uint8Array(body).buffer;
  return bytesToHex(new Uint8Array(await crypto.subtle.sign('HMAC', key, message)));
};

const safeEqual = (left: string, right: string): boolean => {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
};

const eventId = async (eventType: string, reference: string): Promise<string> => {
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${eventType}:${reference}`),
  );
  return bytesToHex(new Uint8Array(bytes));
};

const monthInLagos = (): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
  }).format(new Date());

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405);

  const rawBody = new Uint8Array(await request.arrayBuffer());
  const signature = request.headers.get('monnify-signature') ?? '';
  if (!/^[a-f\d]{128}$/i.test(signature) || !safeEqual(await hmac(rawBody), signature.toLowerCase())) {
    return jsonResponse({ error: 'Invalid signature.' }, 401);
  }

  try {
    const body = JSON.parse(new TextDecoder().decode(rawBody)) as {
      eventType?: string;
      eventData?: Record<string, unknown>;
    };
    const eventType = body.eventType ?? '';
    const data = body.eventData ?? {};

    if (eventType === 'SUCCESSFUL_TRANSACTION') {
      const product = data.product as Record<string, unknown> | undefined;
      if (product?.type === 'RESERVED_ACCOUNT') {
        const reference = String(data.transactionReference ?? data.paymentReference ?? '');
        const accountReference = String(product.reference ?? '');
        const amountKobo = Math.round(Number(data.amountPaid ?? 0) * 100);
        const { error } = await supabase.rpc('credit_monnify_deposit', {
          p_event_id: await eventId(eventType, reference),
          p_event_type: eventType,
          p_transaction_reference: reference,
          p_account_reference: accountReference,
          p_amount_kobo: amountKobo,
          p_month: monthInLagos(),
        });
        if (error) throw error;
      }
    } else if (
      ['SUCCESSFUL_DISBURSEMENT', 'FAILED_DISBURSEMENT', 'REVERSED_DISBURSEMENT'].includes(
        eventType,
      )
    ) {
      const reference = String(data.reference ?? '');
      const id = await eventId(eventType, reference);
      const { data: existing } = await supabase
        .from('webhook_events')
        .select('event_id')
        .eq('event_id', id)
        .maybeSingle();
      if (!existing) {
        const status =
          eventType === 'SUCCESSFUL_DISBURSEMENT'
            ? 'completed'
            : eventType === 'REVERSED_DISBURSEMENT'
              ? 'reversed'
              : 'failed';
        const { error } = await supabase.rpc('settle_emergency_withdrawal', {
          p_monnify_reference: reference,
          p_status: status,
          p_reason: data.transactionDescription ?? null,
          p_transaction_reference: data.transactionReference ?? null,
        });
        if (error) throw error;
        await supabase.from('webhook_events').insert({
          event_id: id,
          event_type: eventType,
          reference,
        });
      }
    }

    return jsonResponse({ received: true });
  } catch {
    return jsonResponse({ received: false }, 500);
  }
});
