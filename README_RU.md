# HILL — King of the Board

**Live:** https://hill.javazhan.tech
**GitHub:** https://github.com/DEFTileu/HILL-Checker
**Built for:** nFactorial Incubator 2026 (24-hour checkers challenge)

---

## Что мы сделали

Веб-платформу для шашек **с новым жанром — 4-player King of the Hill**. На рынке шашек тысячи копий классики, мы добавили **уникальную механику, которой нет ни у кого**: 4 игрока стартуют из углов 10×10 доски, рвутся к центру 2×2 («Hill»), становятся дамками при попадании в центр, и побеждает **либо последний выживший, либо все, кто удержал Hill** к концу 7-го раунда — то есть может быть **несколько победителей одновременно («Joint Kings»)**.

**Три режима в одном движке:**
- **Classic 2P** — стандартные шашки, 8×8
- **Hill Blitz** — 4 игрока, 7 раундов, multi-king победа
- **Hill Survival** — 4 игрока, до последнего выжившего

**Мультиплеер по ссылке** для всех режимов (Classic 2P + Hill 4P) через Supabase Realtime. Создал комнату → расшарил QR-код или 4-буквенный код → друзья заходят с телефона. 10-секундный grace period при дисконнекте (вернулся за 10 сек — играешь дальше, иначе шашки сжигаются).

---

## Для кого это

- **TikTok/Reels-аудитория 16-25** — короткие 3-минутные блиц-партии с шеринг-кнопкой результата
- **Друзья на вечеринках** — 4 человека с телефонами в одной комнате, никаких приложений ставить не надо (web-only, QR-код в лобби)
- **Стримеры и киберспорт** — мультиплеер с реальным ELO-рейтингом, премиум-скины, лидерборд
- **Казуальные игроки** — мобильный приоритет, играешь одной рукой пальцем

---

## Почему это ценно (бизнес-сигналы для жюри)

**1. Уникальная механика = виральность.**
4-player King of the Hill в шашках — это **новый жанр**, который сам по себе TikTok-shareable. Лидер «Joint Kings» (несколько победителей) создаёт мемы типа «мы с другом договорились и оба выиграли». В классике этого нет.

**2. Реальная монетизация.**
- **Stripe-интеграция полностью работает** (test mode для демо): 3 премиум-скина по $1.99 / $2.99 / $4.99, webhook грантит скин после оплаты через signature verification
- Test card: `4242 4242 4242 4242` — можно проверить полный flow покупки

**3. Retention-механики.**
- Анонимная авторизация (можно играть сразу) + Google OAuth для cross-device sync
- **Реальная ELO-система** (K=32 pairwise, +24/-24 за равных, корректные апдейты для multi-winner Hill)
- 5 арена-тиров (Bronze → Silver → Gold → Master → Champion) — каждый разблокирует новый скин при достижении
- Лидерборд Top 100 по ELO с client-side поиском

**4. Mobile-first продукт.**
Основная аудитория на телефонах — поэтому каждый экран спроектирован 375px-first с safe-area-inset, 44px touch-targets и QR-кодом для мобильного шеринга. Desktop — адаптация, не «портретный сайт растянутый на ноут».

---

## Что делает продукт техничным (engineering quality)

- **Pure-TypeScript engine** в `lib/engine/` — zero React/network coupling, runnable in Node. Один и тот же движок обслуживает все 3 режима через `GameConfig` пресеты и **hot-seat + multiplayer одинаково** (zero дублирования логики).
- **80+ unit-тестов** покрывают rules engine (multi-jump, mandatory capture, ELO formula, win conditions для всех 3-х режимов).
- **Realtime sync** через Supabase channels (Presence + Broadcast) **без DB-записей на каждый ход** — только snapshot для rejoin и финальный recordGame со всеми участниками (winners + losers).
- **Колорблайнд-доступность** — каждый игрок имеет уникальную **форму** (круг/квадрат/треугольник/шестиугольник), не только цвет. Скины — декораторы поверх формы.
- **Stripe webhook signature verification** (защита от подделки событий), service-role key только server-side.
- Deployed on Vercel с custom domain `hill.javazhan.tech`.

---

## Tech stack

- Next.js 14 (App Router) + TypeScript strict + Tailwind CSS
- Supabase (Auth + Postgres + Realtime)
- Stripe (Checkout + Webhooks)
- Vercel deploy

## Local dev

```bash
npm install
# Create Supabase project, run lib/db/schema.sql in SQL editor
# Add to .env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
#                    SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY,
#                    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
npm run dev