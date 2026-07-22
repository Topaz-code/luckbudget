export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
    public readonly code = 'invalid-request',
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
