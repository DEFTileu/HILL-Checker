import { getServiceClient, getUserFromRequest } from '@/lib/multiplayer/server';
import { generateUniqueCode } from '@/lib/multiplayer/code';

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  let mode = 'hill-blitz';
  try {
    const body = await req.json();
    if (body?.mode !== undefined && body?.mode !== null) {
      if (
        body.mode !== 'hill-blitz' &&
        body.mode !== 'hill-survival' &&
        body.mode !== 'classic-2p'
      ) {
        return Response.json({ error: 'invalid mode' }, { status: 400 });
      }
      mode = body.mode;
    }
  } catch {
    // empty/invalid body → keep default mode
  }

  const sb = getServiceClient();
  try {
    const code = await generateUniqueCode(async (c) => {
      const { data } = await sb.from('rooms').select('id').eq('id', c).maybeSingle();
      return !!data;
    });
    const { error } = await sb.from('rooms').insert({
      id: code,
      host_user_id: user.id,
      mode,
      status: 'lobby',
      state: null,
    });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ id: code });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
