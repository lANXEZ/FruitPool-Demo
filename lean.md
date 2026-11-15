# FRUITPOOL: Lean Startup notes

What we have learned from real people, what we changed because of it, and what we still need to test.
Each round follows **Build → Measure → Learn**: change the smallest thing that tests an idea,
watch what people do, then decide what to change next.

**Where we are honestly.** Rounds 1–3 gave us *usability* learning from one beta tester and eight
friends. That is useful for the demo, but it is opinion, not customer behaviour. *Validated* learning
in the Lean Startup sense starts with the task test and the concierge MVP below.

## Lean techniques we used

| Technique | What we did |
|---|---|
| **Minimum viable product (MVP)** | The demo itself: a clickable website with made-up data and no backend, enough to test whether people understand and can use FRUITPOOL before building the real system. |
| **Build → Measure → Learn** | Three rounds so far (below). Each starts from what testers told us and ends with a change to the demo. |
| **Validated learning** (partly) | So far our changes come from user feedback rather than our own guesses (the beta tester in round 1, the survey in round 2), but this is usability feedback from friends, not evidence from real customers. Validated learning about the business (A2–A5) comes from the concierge MVP and the price test. |
| **Leap-of-faith assumptions** | We wrote down the beliefs the business depends on (A1–A5), split into value and growth hypotheses, and track which ones are tested. |
| **Small batches** | Each improvement shipped on its own small branch. Round 3 changed four things, and three of them are each tied to one measure (see Round 3), so the next round can show whether that change helped. The fourth ("less text") touches every screen, so its effect cannot be separated. |
| **Actionable metrics** (planned) | Round 2 used 1–5 opinion scores, which helped us find weak spots but are not actionable metrics. From the next round we measure behaviour: task completion, time per task, where people get stuck, real orders and reorders, and paid sign-ups, instead of page views, sign-ups or "would you". |
| **Innovation accounting** | Round 2 is our usability baseline. Because the next round uses different people (real shop owners and farmers) and only 8 people answered round 2, we do not compare scores directly; instead we set behaviour targets for the task test and the pilot, and check them there. |
| **Pivot or persevere** | Planned: we set the decision rule before the mango pilot, so the result can't be argued afterwards. |
| **Concierge MVP** (planned) | Doing the pooling by hand for real shops and one farmer before automating it. |
| **Price test** (planned) | Offering grade verification to real farmers as a paid pre-sale and counting who pays. |
| **Go and see for yourself** (planned) | Watching real shop owners and farmers try the demo, instead of asking friends what they think. |

## Leap-of-faith assumptions

The business only works if these are true. Most are **not tested yet**.
*Value* hypotheses ask whether FRUITPOOL is worth using; *growth* hypotheses ask whether it can spread
and sustain itself.

| # | Assumption | Type | Status |
|---|---|---|---|
| A1 | Shops and farmers understand pooling ("buy together, pay less") | Value | Supported by the survey (4.6 / 5), but only opinions from friends |
| A2 | Shops will wait a few days for a group to fill in exchange for a lower price | Value | Not tested |
| A3 | Farmers will set tiered prices and accept pooled orders | Value | Not tested: no real farmers yet |
| A4 | Enough shops in one area order the same fruit to fill a group | Growth | Not tested |
| A5 | Farmers will pay for grade verification and promotion | Value (revenue) | Weak signal only (stated, not paid) |

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

**Measured (Google Form, 15 Nov 2026, after the redesign).** 8 responses: classmates and friends, 6 of 8 aged 18–24, one aged 45+,
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
- The 3.0 for older farmers is mostly young people guessing for someone else (only one respondent was 45+),
  so it is a warning sign, not a measurement. Older users must be tested directly.
- Delivered cost is the core idea, yet most people only "somewhat" got it.
- Grade verification is the most promising paid service; promotion is the weakest.
- **Limits of this data:** 8 friends answering about a demo is opinion, not behaviour, and with 8 people
  a difference of a few tenths of a point is within noise. "Would pay" is not paying. It tells us about
  usability, not whether the business works (A2–A5).

## Round 3: changes from the survey

**Built.** Each change is tied to the measure it should move.

| Change | Why (round 2 finding) | Measure it should move |
|---|---|---|
| **Join this group**: a shop can join a group from its card; the order form opens filled in (fruit, area, date, use, a price limit), and the shop only enters the kilos. Farmers' listings on the Market have an **Order this fruit** button too. | Shops wanted to order straight from a group or listing | Finding the next step (task 1 below) |
| **Delivered cost shown as a sum** on each group: fruit + shipping + fee, without opening details. | Only 3 of 8 found delivered cost clear | Explaining the delivered cost correctly (task 3 below) |
| **Farmer offers explained**: under "Send offer", the price comes from the farmer's own listing for that volume, and shops confirm before the deal is final. | A farmer expected "Send offer" to change the price | Farmers completing an offer without confusion (task 2 below) |
| **Less text**: shorter group intros, status messages and form hints. The optional "what you pay now" box is folded away. | "The text feels overwhelming" | All tasks; its effect cannot be separated from the others |

**Measure next (behaviour targets for the task test).** These replace a direct score comparison with round 2,
because the testers will be different people.
- Task 1, "order 30 kg of mango": at least **4 of 5** shop owners finish it without help.
- Task 2, "post your mangoes and answer a group": at least **2 of 3** farmers finish it without help,
  including at least one older farmer.
- Task 3: after viewing a group, at least **4 of 5** shop owners can say in their own words what the delivered
  cost includes.
- For every task we also record time taken and the screen where people got stuck.
- We still ask the round 2 questions at the end, as supporting opinion, with older testers rating
  "an older farmer could use it" themselves.

## Next experiments

| # | Experiment | Owner | When |
|---|---|---|---|
| 1 | Task test | *(name)* | *(date)* |
| 2 | Concierge MVP (mango pilot) | *(name)* | *(dates, 2 weeks)* |
| 3 | Price test for grade verification | *(name)* | *(date)* |

1. **Task test with real users.** 5 shop owners and 2–3 farmers, including older people. Give the tasks
   above and record whether they finish, how long it takes, and where they get stuck. Watch; don't help.
2. **Concierge MVP for the mango pilot.** For 2 weeks, pool orders by hand in one area (LINE group
   or Google Form) for 10 juice shops and cafés and one mango farmer, and run real deliveries.
   - **Before the pilot**, record what each shop currently pays per kg for mango and how often it buys,
     so the saving can be measured against a real baseline.
   - Measure: shops who place a real pooled order (ideally with a small deposit), reorders within the
     2 weeks, and the real saving compared with the baseline. This tests A2–A4 with behaviour.
3. **Price test for grade verification.** Offer it as a paid pre-sale to at least 10 real farmers at one
   price (300 ฿) and count how many pay. If fewer than 3 pay, repeat at 150 ฿. With only a few farmers,
   splitting them into two price groups at once would be too small to compare.

**Pivot or persevere: decided before the pilot.** Counted over the 2-week pilot, as a share of the shops recruited:
- **Persevere** if at least **60%** of shops place a real pooled order **and** at least **30%** of shops reorder
  within the 2 weeks.
- **Pivot** if fewer than **30%** of shops place a pooled order, or most shops say they will not wait for a
  group to fill. A possible pivot is fixed weekly delivery days per area instead of waiting for groups.
- **In between:** run one more 2-week round with the biggest problem fixed, then apply the same rule. We do
  not run a third round on the same rule.
