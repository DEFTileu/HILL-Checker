import { getServiceClient } from '@/lib/multiplayer/server';

// Public room lookup by code. Room codes are 4-char uppercase; we normalize
// the path segment so /join is case-insensitive. 200 with minimal room shape,
// or 404 if the code doesn't exist.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const id = (code ?? '').trim().toUpperCase();
  if (!id) return Response.json({ error: 'not found' }, { status: 404 });

  const sb = getServiceClient();
  const { data, error } = await sb
    .from('rooms')
    .select('id, mode, status')
    .eq('id', id)
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: 'not found' }, { status: 404 });

  return Response.json({ id: data.id, mode: data.mode, status: data.status });
}
