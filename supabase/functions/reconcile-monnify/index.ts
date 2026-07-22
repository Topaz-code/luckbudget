import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { jsonResponse } from '../_shared/http.ts';
import { getTransferStatus } from '../_shared/monnify.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false, autoRefreshToken: false } },
);

Deno.serve(async (request) => {
  if (request.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) {
    return jsonResponse({ error: 'Unauthorized.' }, 401);
  }

  const { data: pending, error } = await supabase
    .from('withdrawal_requests')
    .select('monnify_reference')
    .eq('status', 'pending_transfer')
    .limit(100);
  if (error) return jsonResponse({ error: 'Could not load pending transfers.' }, 500);

  const results = await Promise.allSettled(
    (pending ?? []).map(async ({ monnify_reference: reference }) => {
      const transfer = await getTransferStatus(reference);
      const normalized = transfer.status.toUpperCase();
      const status =
        normalized === 'SUCCESS'
          ? 'completed'
          : normalized === 'REVERSED'
            ? 'reversed'
            : ['FAILED', 'FAILURE'].includes(normalized)
              ? 'failed'
              : null;
      if (!status) return;
      await supabase.rpc('settle_emergency_withdrawal', {
        p_monnify_reference: reference,
        p_status: status,
        p_reason: `Reconciled status: ${normalized}`,
        p_transaction_reference: transfer.transactionReference ?? null,
      });
    }),
  );

  return jsonResponse({ checked: results.length });
});
