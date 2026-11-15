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

1. **Start page** (`/`): asks *who are you?* A shop or a farmer can **start** (create an account) or **try a sample account**.
2. **My page** (`/me`): every order or listing the viewer has, each with a four-step tracker, one plain sentence on where it stands, and the button for the next step. Items that need the viewer are marked *Your turn* and counted in the menu badge.
3. Try the sample **shop**: its mango order is in a group with 2 other Ari shops (a fourth café is left out: its 50 ฿ limit is below the price) at **55 ฿/kg** delivered (120 kg reaches the 48 ฿ tier, + 5 ฿ shared shipping + 2 ฿ fee), waiting for Lung Chai Mango Orchard to send an offer.
4. Open **Demo controls** (bottom right) and switch to *Lung Chai Mango Orchard*. My page shows two groups ready for an offer: **See group and send offer** jumps to the pool, then **Send offer to this pool**.
5. **Deal room**: each deal says whose turn it is. Switch back to the shop: My page now asks it to confirm. The farmer ships, shops confirm receipt or report a problem. The demo shortcut button plays the other parties' steps.
6. **Pools**: also shows pools that are *not* viable (pineapple pool 45 kg short of the farmer minimum; a processing order too expensive from one farmer but fine from another).
7. **Market board**: post a demand (as a shop) or a listing with your own price tiers (as a farmer). After posting you land on My page, which says what happens next.
8. **Insights**: open requests and completed deals kept separate, labelled as FRUITPOOL-internal trends. **How it works** has the seven-step concept and the concept doc's example pool.

**Demo controls** (bottom right) hold the presenter tools: switch user, create an account, **Reset demo**.

## Where things live

| File | What |
|---|---|
| `src/lib/pool.ts` | Pooling, quality-to-purpose, tier pricing, landed cost. All pure functions. |
| `src/seed.ts` | Demo users, demands, listings, past deals (hypothetical figures). |
| `src/store.tsx` | App state, localStorage persistence, deal status flow. |
| `src/i18n.ts` | Thai / English strings. |
| `src/pages/*` | Start, My page, How it works, Market board, Pools, Deal room, Insights, Join. |
| `src/lib/journey.ts` | Works out each viewer's next step for My page, the menu badge and the Deal room. |

## Rules in this demo

- Purpose → accepted grades: fresh sale A; juicing A/B; smoothies A/B/C; processing B/C.
- Pool window: delivery dates within 3 days, same delivery zone.
- Shipping per kg = truck trip cost ÷ pooled kg + per-kg rate by farm region (central 360 ฿/trip + 2 ฿/kg, east 600 + 2.5, north 1,200 + 3, northeast 1,000 + 3).
- Fee: 2 ฿/kg. A shop's "limit" is its max **landed** cost per kg.

## Moving to a real backend later

Swap `src/store.tsx` for Supabase (Postgres + Auth): tables mirror `src/types.ts`, the pooling functions can run unchanged on the client or as a Postgres function, and Row Level Security restricts who can confirm, ship and receive.
