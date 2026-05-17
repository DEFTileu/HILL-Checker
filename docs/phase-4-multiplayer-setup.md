# Phase 4 — Multiplayer Setup (manual, ~1 min)

All Phase 4 code is complete. One dashboard-only secret is required.

## 1. Add the service-role key

Supabase Dashboard → **Settings → API** → copy the **`service_role`** secret
(NOT the publishable key). Add it to `.env.local`:

```
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

Restart `npm run dev`. Until this is set, `POST /api/rooms` and
`POST /api/games` return 500 with "Supabase service env missing".

> The key is server-only (no `NEXT_PUBLIC_` prefix) — it must never reach the
> browser. It is read solely by `lib/multiplayer/server.ts` in API routes.

## 2. Schema

`rooms`, `games`, `game_players` and their RLS policies already ship in
`lib/db/schema.sql` (run during Phase 3). No schema change for Phase 4.

## 3. Acceptance test

| Step | Expected |
|---|---|
| Open `/` → "Create Hill Room" (or visit `/r/new`) | Redirects to `/r/ABCD` |
| Copy the URL, open in an incognito window | Second tab joins the lobby |
| Open two more incognito tabs | 4 players shown in the lobby |
| Host clicks **Start Game** | All 4 tabs render the board, P1 active |
| P1 makes a move | All 4 tabs update |
| Play to completion | All see the Game Over overlay |
| Check Supabase → Table Editor | New row in `games`, 2–4 rows in `game_players`, winners' `total_wins` incremented |
