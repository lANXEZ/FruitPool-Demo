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

Menus are named after what each role is doing, so shops and farmers see different labels for the same pages:

| Page | Shop sees | Farmer sees |
|---|---|---|
| `/me` | My orders | My sales |
| `/board` | Market | Market |
| `/pools` | Buying groups | Shops buying |
| `/deals` | My deals (only their own) | My deals (only their own) |
| `/insights` | (not in the menu) | Insights |

On phones the menu becomes a tab bar at the bottom of the screen.

1. **Start page** (`/`): asks *who are you?* A shop or a farmer can **start** (create an account) or **try a sample account**.
2. **My orders / My sales** (`/me`): every order or listing the viewer has, each with a four-step tracker, one plain sentence on where it stands, and the button for the next step. Items that need the viewer are marked *Your turn* and counted in the menu badge.
3. Try the sample **shop**: its mango order is in a group with 2 other Ari shops (a fourth café is left out: its 50 ฿ limit is below the price) at **55 ฿/kg** delivered (120 kg reaches the 48 ฿ tier, + 5 ฿ shared shipping + 2 ฿ fee), 4 ฿ less than it pays now, waiting for Lung Chai Mango Orchard to send an offer.
4. Open **Demo controls** (bottom right) and switch to *Lung Chai Mango Orchard*. My sales shows two groups ready for an offer: **See group and send offer** jumps to the group, then **Send offer to this pool**.
5. **My deals**: each deal says whose turn it is. Switch back to the shop: My orders now asks it to confirm. The farmer ships, shops confirm receipt or report a problem. The demo shortcut button plays the other parties' steps.
6. **Buying groups / Shops buying**: each group opens with one line for the viewer (what a shop pays and saves, or what a farmer would earn) and the next button; **See details** shows the price tiers, the shops and the cost breakdown. A **?** next to terms such as *limit* and *delivered cost* explains them. Groups that are *not* ready show why (pineapple 45 kg short of the farmer's minimum; a processing order too expensive from one farmer but fine from another).
7. **Market**: post a demand (as a shop) or a listing with your own price tiers (as a farmer). After posting you land on My orders / My sales, which says what happens next.
8. **Insights** (farmers): open requests and completed deals kept separate, labelled as FRUITPOOL-internal trends. **How it works** (the **?** in the menu) has the seven-step concept and the concept doc's example group.

9. **Farmer add-ons (revenue)**: as a farmer, your own listings on **Market** have two paid buttons, also offered as checkboxes when posting a listing. **Verify grade** (300 ฿) puts the listing in *waiting for the inspector*; the demo shortcut plays the inspection, then shops see a **Verified grade** badge on the Market and in groups. **Promote** (150 ฿ for 7 days) lists it first on the Market with a **Promoted** label; buying again extends it by 7 days from the current end. Each purchase asks for confirmation; no real payment is taken.
10. **FRUITPOOL revenue** (from **Demo controls** or **How it works**): the platform's income from the 2 ฿/kg deal fee, grade verification and promoted listings, with every item listed. It is computed live: finish a deal or buy an add-on and the total moves.

**Demo controls** (bottom right) hold the presenter tools: switch user, create an account, **FRUITPOOL revenue**, **Reset demo**.

## Where things live

| File | What |
|---|---|
| `src/lib/pool.ts` | Pooling, quality-to-purpose, tier pricing, landed cost. All pure functions. |
| `src/seed.ts` | Demo users, demands, listings, past deals (hypothetical figures). |
| `src/store.tsx` | App state, localStorage persistence, deal status flow. |
| `src/i18n.ts` | Thai / English strings. |
| `src/pages/*` | Start, My orders / My sales, How it works, Market, groups, My deals, Insights, Join. |
| `src/lib/revenue.ts` | FRUITPOOL's income from deal fees and farmer add-ons (Revenue page). |
| `src/lib/journey.ts` | Works out each viewer's next step for My page, the menu badge and the Deal room. |

## Rules in this demo

- Purpose → accepted grades: fresh sale A; juicing A/B; smoothies A/B/C; processing B/C.
- Pool window: delivery dates within 3 days, same delivery zone.
- Shipping per kg = truck trip cost ÷ pooled kg + per-kg rate by farm region (central 360 ฿/trip + 2 ฿/kg, east 600 + 2.5, west 450 + 2, north 1,200 + 3, northeast 1,000 + 3, south 1,400 + 3.5).
- Fee: 2 ฿/kg. A shop's "limit" is its max **landed** cost per kg.
- Farmer add-ons (placeholder prices; the concept doc lists Featured Listing as a revenue stream but sets no price): grade verification 300 ฿ per listing, promotion 150 ฿ per 7 days. Both are in `settings` in `src/seed.ts`.
- A promotion changes **placement only**: it lists the farmer first on the Market. Matching still picks the farmer with the lowest delivered cost, so paying never changes which farmer wins a group or what a shop pays.

## Moving to a real backend later

Swap `src/store.tsx` for Supabase (Postgres + Auth): tables mirror `src/types.ts`, the pooling functions can run unchanged on the client or as a Postgres function, and Row Level Security restricts who can confirm, ship and receive.
