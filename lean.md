# FRUITPOOL: Lean Startup notes

What we have learned from real people, what we changed because of it, and what we still need to test.
Each round follows **Build → Measure → Learn**: change the smallest thing that tests an idea,
watch what people do, then decide what to change next.

## Leap-of-faith assumptions

The business only works if these are true. Most are **not tested yet**.

| # | Assumption | Status |
|---|---|---|
| A1 | Shops and farmers understand pooling ("buy together, pay less") | Supported by the survey (4.6 / 5), but only opinions from friends |
| A2 | Shops will wait a few days for a group to fill in exchange for a lower price | Not tested |
| A3 | Farmers will set tiered prices and accept pooled orders | Not tested: no real farmers yet |
| A4 | Enough shops in one area order the same fruit to fill a group | Not tested |
| A5 | Farmers will pay for grade verification and promotion | Weak signal only (stated, not paid) |

## Round 1: a beta tester could not follow the demo → big redesign

**Learned.** Our very first beta tester found the UI hard to follow. They did not know what to do first or
where the next step happened, and they **could not see the progress of their order or listing**.

**Built (redesign, 15 Nov 2026, PR #3).**
- A start page that asks "Are you a shop or a farmer?" and sends each to their first step.
- **My page** with a four-step progress tracker for every order and listing, a plain sentence about
  where it stands, and one button for the next step.
- A red count on the menu for things waiting on you, and a "next step" strip on deals.
- Group cards that answer "what do I pay / what do I earn" first, with details behind a tap.
- Plain words with "?" explanations, larger text, 44px buttons and a bottom tab bar on phones.

## Round 2: feedback survey on the redesigned demo

**Measured (Google Form, 15 Nov 2026).** 8 responses: classmates and friends, 6 of 8 aged 18–24, one aged 45+,
3 had run a shop or traded fruit, 5 used a phone. Nobody was a real farmer.

| Measure (1–5 unless noted) | Result |
|---|---|
| Pooling small orders makes sense | **4.6** |
| "Verified grade" badge raises trust | **4.6** |
| Text and buttons easy to read and tap | 4.4 |
| Knew what to do first | 4.3 |
| Wording easy to understand | 4.3 |
| Would use FRUITPOOL | 4.3 |
| Overall rating | 4.1 |
| Knew where to go for the next step | 3.9 |
| Understood what FRUITPOOL does, quickly | 3.9 |
| **An older farmer could use it** | **3.0**: lowest |
| "Delivered cost" was clear | 3 clear, 5 "somewhat" |
| Would pay 300 ฿ for grade verification | 5 yes, 3 only if cheaper, 0 no |
| Would pay 150 ฿ to promote for 7 days | 4 yes, 2 only if cheaper, 2 no |
| 2 ฿/kg deal fee | 4 about right, 2 too low, 1 too high, 1 not sure |

What people wrote, in short:
- The text and details feel overwhelming.
- A farmer expected "Send offer" to let them change the price.
- A shop wanted to order straight from a group or listing, without going back to post an order.
- They liked the progress tracker, matching by quality, and getting price and quality together.

**Learned.**
- The redesign fixed "what do I do first" (4.3). "Where do I go next" (3.9) and older users (3.0) are the weak spots.
- Delivered cost is the core idea, yet most people only "somewhat" got it.
- Grade verification is the most promising paid service; promotion is the weakest.
- **Limits of this data:** 8 friends answering about a demo is opinion, not behaviour. "Would pay"
  is not paying. It tells us about usability, not whether the business works (A2–A5).

## Round 3: changes from the survey

**Built.**
- **Join this group**: a shop can join a group from its card; the order form opens filled in
  (fruit, area, date, use, a price limit), and the shop only enters the kilos. Farmers' listings
  on the Market have an **Order this fruit** button too.
- **Delivered cost shown as a sum** on each group: fruit + shipping + fee, without opening details.
- **Farmer offers explained**: under "Send offer", the price comes from the farmer's own listing
  for that volume, and shops confirm before the deal is final.
- **Less text**: shorter group intros, status messages and form hints. The optional "what you pay
  now" box is folded away.

**Measure next (targets for the next round).**
- "Knew where to go next" from 3.9 to **4.3 or more**.
- "An older farmer could use it" from 3.0 to **4.0 or more**, rated by older people themselves.
- "Delivered cost was clear": **6 of 8** or more answer "clear".

## Next experiments

1. **Task test with real users.** 5 shop owners and 2–3 farmers, including older people. Give tasks
   ("order 30 kg of mango", "post your mangoes") and record whether they finish, how long it takes,
   and where they get stuck. Watch; don't help.
2. **Concierge MVP for the mango pilot.** For 1–2 weeks, pool orders by hand in one area (LINE group
   or Google Form) for 5–10 juice shops and cafés and one mango farmer, and run one real delivery.
   Measure: shops who commit (ideally with a small deposit), reorders, and the real saving
   compared with what they pay now. This tests A2–A4 with behaviour.
3. **Price test for grade verification.** Offer it to real farmers at two prices (for example 300 ฿
   and 150 ฿) and count sign-ups, not "would you".

**Pivot or persevere: decide before the pilot.** Persevere if at least 6 of 10 shops place a real
pooled order and at least 3 reorder. If shops will not wait for groups to fill, consider a pivot
such as fixed weekly delivery days per area.
