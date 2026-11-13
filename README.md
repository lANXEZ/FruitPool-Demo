# FruitPool-Demo
A web application solution for TU109 term project.

Clickable demo of **FRUITPOOL**, a B2B fruit marketplace built around *Conditional Demand Pooling*: small SME orders are pooled when fruit, delivery zone, dates and quality-for-purpose line up, then priced against farmer-set volume tiers with a true landed cost (fruit + shared shipping + fee).

This is a **frontend-only demo**: no backend or database. Seed data is built in and every change is saved in the viewer's browser (`localStorage`). **Reset demo** in the header restores the seed. Seed dates move forward automatically, so pools stay "upcoming" whenever you present.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
```

## Deploy to Vercel (free)

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project → Import** the repo.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output `dist`. No environment variables.
4. Deploy. `vercel.json` already rewrites all routes to `index.html`, so deep links like `/pools` work on refresh.

## Demo walkthrough

1. **Overview**: the concept doc's example (shops ordering 30 + 40 + 50 kg of mango) running on the real rules: 120 kg reaches the 48 ฿ tier, + 5 ฿ shared shipping + 2 ฿ fee = **55 ฿/kg**, which is 4 ฿ under the 59 ฿ they pay now. A fourth café whose limit is 50 ฿ is automatically left out.
2. **Pools**: also shows pools that are *not* viable (pineapple pool 45 kg short of the farmer minimum; a processing order too expensive from one farmer but fine from another).
3. Switch **Viewing as** to *Lung Chai Mango Orchard*, then press **Send offer to this pool**.
4. **Deal room**: shops confirm, the farmer ships, shops confirm receipt or report a problem. The demo shortcut button plays the other parties' steps.
5. **Insights**: open requests and completed deals kept separate, labelled as FRUITPOOL-internal trends.
6. **Market board**: post a demand (as a shop) or a listing with your own price tiers (as a farmer). New posts join pools immediately.

## Where things live

| File | What |
|---|---|
| `src/lib/pool.ts` | Pooling, quality-to-purpose, tier pricing, landed cost. All pure functions. |
| `src/seed.ts` | Demo users, demands, listings, past deals (hypothetical figures). |
| `src/store.tsx` | App state, localStorage persistence, deal status flow. |
| `src/i18n.ts` | Thai / English strings. |
| `src/pages/*` | Overview, Market board, Pools, Deal room, Insights. |

## Rules in this demo

- Purpose → accepted grades: fresh sale A; juicing A/B; smoothies A/B/C; processing B/C.
- Pool window: delivery dates within 3 days, same delivery zone.
- Shipping per kg = truck trip cost ÷ pooled kg + per-kg rate by farm region (central 360 ฿/trip + 2 ฿/kg, east 600 + 2.5, north 1,200 + 3, northeast 1,000 + 3).
- Fee: 2 ฿/kg. A shop's "limit" is its max **landed** cost per kg.

## Moving to a real backend later

Swap `src/store.tsx` for Supabase (Postgres + Auth): tables mirror `src/types.ts`, the pooling functions can run unchanged on the client or as a Postgres function, and Row Level Security restricts who can confirm, ship and receive.
