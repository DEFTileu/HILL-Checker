# Phase 3 — Supabase Dashboard Setup (manual, ~5 min)

All Phase 3 **code** is complete and the app builds. These steps are the
dashboard-only actions Claude Code cannot perform. Do them once, then the
acceptance criteria are testable.

Project: `https://rzammfeiqgxqjbkbhhvn.supabase.co`

## 1. Run the schema

Supabase Dashboard → **SQL Editor** → New query → paste the entire contents of
[`lib/db/schema.sql`](../lib/db/schema.sql) → **Run**.

Creates `profiles`, `games`, `game_players`, `rooms`, the `leaderboard` view,
the `on_auth_user_created` trigger (auto-creates a `Player_XXXX` profile row),
and all RLS policies. Safe to re-run.

## 2. Enable Anonymous sign-in

Dashboard → **Authentication → Sign In / Providers** →
**Anonymous sign-ins** → toggle **ON** → Save.

Without this the auto-guest session fails and no profile is created.

## 3. Enable manual identity linking (for the Google upgrade)

Dashboard → **Authentication → Sign In / Providers** → scroll to
**Manual Linking** → toggle **ON** → Save.

Required so an anonymous user can `linkIdentity({ provider: 'google' })` and
keep the same `user_id` (wins/skin carry over).

## 4. Configure Google OAuth

1. Google Cloud Console → create OAuth 2.0 Client ID (Web application).
2. Authorized redirect URI:
   `https://rzammfeiqgxqjbkbhhvn.supabase.co/auth/v1/callback`
3. Dashboard → **Authentication → Sign In / Providers → Google** →
   paste Client ID + Client Secret → toggle **ON** → Save.
4. Dashboard → **Authentication → URL Configuration** → add your dev origin
   (`http://localhost:3000`) to **Redirect URLs**.

> Phase-3 fallback (spec §11 "Cut if behind"): if Google setup is skipped, the
> app still works anonymous-only — guests can play, the "Sign in with Google"
> button just won't complete the link.

## 5. Verify the acceptance criteria

| Criterion | How to check |
|---|---|
| Fresh visit → row in `auth.users` **and** `profiles` with random `Player_XXXX` | Open the app in an incognito window → Dashboard → Table Editor → `profiles` shows a new row; `Authentication → Users` shows an anonymous user |
| `/profile` edits display name, persists across reload | Go to `/profile`, change name, click away (onBlur saves), reload — name persists |
| `total_wins = 25` → Gold badge | SQL Editor: `update profiles set total_wins = 25 where id = '<your-id>';` → reload `/profile` → ArenaBadge shows **Gold** (thresholds: Bronze 0 / Silver 5 / Gold 25 / Master 75 / Champion 150, from `lib/skins.ts`) |
| Google link keeps same `user_id` | `/profile` → "Sign in with Google" (→ `/login`) → complete OAuth → Dashboard → `Authentication → Users`: same user row now has a Google identity attached; `profiles` row unchanged (wins/skin preserved) |
| Skin selector lock states + selection persists | `/profile` skin row: skins above your tier show 🔒; tapping an unlocked skin updates `profiles.skin_id` (verify in Table Editor) |
