import { useCallback, useMemo } from 'react';
import { useApp } from '../store';
import { usePools } from './usePools';
import { pick } from '../i18n';
import { FRUITS, ZONES } from '../catalog';
import { fmtDate } from './dates';
import type { Deal, DealStatus } from '../types';

/** action: the user has to do something now. wait: someone else does. problem: needs attention. */
export type Tone = 'action' | 'wait' | 'problem';

/** Tones that count as "needs you" in the menu badge and My page summary. */
export const needsYou = (t: { tone: Tone }) => t.tone !== 'wait';

/** One thing the user is in the middle of, with where it stands and what happens next. */
export interface Track {
  id: string; // demand / deal / pool / listing id, used as the anchor on My page
  title: string;
  sub: string;
  steps: string[];
  current: number; // index of the step in progress
  tone: Tone;
  msg: string;
  action?: { label: string; to: string };
  link?: { label: string; to: string };
}

export const ACTIVE_DEAL: DealStatus[] = ['awaiting', 'confirmed', 'shipped', 'disputed'];
const ORDER: Record<Tone, number> = { action: 0, problem: 1, wait: 2 };
export const landedOf = (d: Deal) => d.pricePerKg + d.shippingPerKg + d.feePerKg;

/**
 * What the current viewer should know about one deal: their next step, or who they are waiting for.
 * Null when the viewer is not part of the deal.
 */
export function useDealNext() {
  const { me, t, lang, num, userById } = useApp();
  return useCallback((deal: Deal): { tone: Tone; msg: string } | null => {
    const farmer = pick(userById(deal.farmerId).name, lang);
    const date = fmtDate(deal.deliveryDate, lang);
    // Count shops, not order lines: one shop can have two orders in the same deal.
    const shops = (lines: Deal['lines']) => new Set(lines.map((l) => l.buyerId)).size;
    const unconfirmed = deal.lines.filter((l) => !l.confirmed);
    if (me.id === deal.farmerId) {
      switch (deal.status) {
        case 'awaiting': return { tone: 'wait', msg: t('m_f_wait_confirm', { n: shops(unconfirmed), total: shops(deal.lines) }) };
        case 'confirmed': return { tone: 'action', msg: t('m_f_ship', { date, zone: pick(ZONES[deal.zone], lang) }) };
        case 'shipped': return { tone: 'wait', msg: t('m_f_wait_receive') };
        case 'disputed': return { tone: 'problem', msg: t('m_f_disputed') };
        default: return null;
      }
    }
    const mine = deal.lines.filter((l) => l.buyerId === me.id);
    if (mine.length === 0) return null;
    switch (deal.status) {
      case 'awaiting': {
        const toConfirm = mine.filter((l) => !l.confirmed);
        if (toConfirm.length === 0) {
          return { tone: 'wait', msg: t('m_b_wait_others', { n: shops(unconfirmed.filter((l) => l.buyerId !== me.id)) }) };
        }
        const kg = toConfirm.reduce((s, l) => s + l.qtyKg, 0);
        return { tone: 'action', msg: t('m_b_confirm', { farmer, price: num(landedOf(deal)), total: num(kg * landedOf(deal)) }) };
      }
      case 'confirmed': return { tone: 'wait', msg: t('m_b_wait_ship', { farmer, date }) };
      case 'shipped':
        return mine.every((l) => l.received) ? { tone: 'wait', msg: t('m_b_received_wait') } : { tone: 'action', msg: t('m_b_receive') };
      case 'disputed': return { tone: 'problem', msg: t('m_b_disputed') };
      default: return null;
    }
  }, [me, t, lang, num, userById]);
}

/** Everything the current viewer has in progress, most urgent first, plus how many are finished. */
export function useTracks(): { tracks: Track[]; done: number } {
  const { state, me, t, lang, num, userById } = useApp();
  const pools = usePools();
  const dealNext = useDealNext();

  return useMemo(() => {
    const fruit = (f: keyof typeof FRUITS) => pick(FRUITS[f], lang);
    const zone = (z: keyof typeof ZONES) => pick(ZONES[z], lang);
    const date = (iso: string) => fmtDate(iso, lang);
    const farmerName = (id: string) => pick(userById(id).name, lang);
    const tracks: Track[] = [];
    let done = 0;

    if (me.role === 'buyer') {
      const steps = [t('js_b1'), t('js_b2'), t('js_b3'), t('js_b4')];
      for (const d of state.demands.filter((x) => x.buyerId === me.id)) {
        if (d.status === 'done') {
          done++;
          continue;
        }
        const base = {
          id: d.id,
          title: `${fruit(d.fruit)} ${num(d.qtyKg)} ${t('kg')}`,
          sub: `${zone(d.zone)} · ${t('needed_by')} ${date(d.neededBy)}`,
          steps,
        };
        if (d.status === 'open') {
          const entry = pools.find((p) => p.pool.demands.some((x) => x.id === d.id));
          const best = entry?.quotes[0];
          const poolLink = entry ? { label: t('l_see_pool'), to: `/pools#${entry.pool.id}` } : undefined;
          if (!entry || !best) {
            tracks.push({ ...base, current: 1, tone: 'wait', msg: t('m_b_nofarmer', { fruit: fruit(d.fruit) }), link: poolLink });
          } else if (best.viable && best.included.some((l) => l.demand.id === d.id)) {
            // Other shops in the priced group: not those dropped for their limit, not this shop's other orders.
            const others = new Set(best.included.map((l) => l.demand.buyerId).filter((b) => b !== me.id)).size;
            const msg = t(others > 0 ? 'm_b_ready' : 'm_b_ready_alone', { n: others, price: num(best.landed!), farmer: farmerName(best.supply.farmerId) });
            tracks.push({ ...base, current: 1, tone: 'wait', msg, link: poolLink });
          } else if (best.viable) {
            tracks.push({ ...base, current: 1, tone: 'problem', msg: t('m_b_over', { price: num(best.landed!), limit: num(d.maxCost) }), link: poolLink });
          } else if (best.reason === 'below_min') {
            tracks.push({ ...base, current: 1, tone: 'wait', msg: t('m_b_more', { n: num(best.kgToMin) }), link: poolLink });
          } else if (best.reason === 'over_budget') {
            tracks.push({ ...base, current: 1, tone: 'problem', msg: t('m_b_over_all', { price: best.fullLanded != null ? num(best.fullLanded) : '–' }), link: poolLink });
          } else {
            tracks.push({ ...base, current: 1, tone: 'wait', msg: t('m_b_stock'), link: poolLink });
          }
          continue;
        }
        // in a deal
        const deal = state.deals.find((x) => ACTIVE_DEAL.includes(x.status) && x.lines.some((l) => l.demandId === d.id));
        const next = deal && dealNext(deal);
        if (!deal || !next) continue;
        const to = `/deals#${deal.id}`;
        const action =
          next.tone === 'action'
            ? { label: t(deal.status === 'awaiting' ? 'a_confirm' : 'a_check_delivery'), to }
            : undefined;
        tracks.push({
          ...base,
          current: deal.status === 'awaiting' ? 2 : 3,
          tone: next.tone,
          msg: next.msg,
          action,
          link: action ? undefined : { label: t('l_see_deal'), to },
        });
      }
    } else {
      const steps = [t('js_f1'), t('js_f2'), t('js_f3'), t('js_f4')];
      const myDeals = state.deals.filter((d) => d.farmerId === me.id);
      done = myDeals.filter((d) => d.status === 'completed').length;

      for (const deal of myDeals.filter((d) => ACTIVE_DEAL.includes(d.status))) {
        const next = dealNext(deal);
        if (!next) continue;
        const to = `/deals#${deal.id}`;
        tracks.push({
          id: deal.id,
          title: `${fruit(deal.fruit)} ${num(deal.totalKg)} ${t('kg')}`,
          sub: `${t('n_shops', { n: new Set(deal.lines.map((l) => l.buyerId)).size })} · ${zone(deal.zone)} · ${t('delivery')} ${date(deal.deliveryDate)}`,
          steps,
          current: deal.status === 'awaiting' ? 2 : 3,
          tone: next.tone,
          msg: next.msg,
          action: next.tone === 'action' ? { label: t('a_ship'), to } : undefined,
          link: next.tone === 'action' ? undefined : { label: t('l_see_deal'), to },
        });
      }

      // Pools where this farmer's listing is the best viable match: ready for an offer.
      const offerReady = new Set<string>();
      for (const { pool, quotes } of pools) {
        const best = quotes[0];
        if (!best?.viable || best.supply.farmerId !== me.id) continue;
        offerReady.add(best.supply.id);
        const shops = new Set(best.included.map((l) => l.demand.buyerId)).size;
        tracks.push({
          id: pool.id,
          title: `${fruit(pool.fruit)} ${num(best.totalKg)} ${t('kg')}`,
          sub: `${t('n_shops', { n: shops })} · ${zone(pool.zone)} · ${t('delivery')} ${date(pool.deliveryDate)}`,
          steps,
          current: 2,
          tone: 'action',
          msg: t(shops > 1 ? 'm_f_offer' : 'm_f_offer_one', { n: shops, kg: num(best.totalKg), price: num(best.price!) }),
          action: { label: t('a_review_offer'), to: `/pools#${pool.id}` },
        });
      }

      // Listings with nothing to do yet: say why, so the farmer is not left guessing.
      const inDeal = new Set(myDeals.filter((d) => ACTIVE_DEAL.includes(d.status)).map((d) => d.supplyId));
      for (const s of state.supplies.filter((x) => x.farmerId === me.id && x.qtyKg > 0)) {
        if (offerReady.has(s.id) || inDeal.has(s.id)) continue;
        const mine = pools.flatMap((p) => p.quotes.filter((q) => q.supply.id === s.id).map((q) => ({ pool: p.pool, q })));
        let msg = t('m_f_none', { fruit: fruit(s.fruit) });
        const beaten = mine.find((m) => m.q.viable);
        const short = mine.find((m) => m.q.reason === 'below_min');
        if (beaten) msg = t('m_f_beaten');
        else if (short) msg = t('m_f_more', { kg: num(short.pool.totalKg), min: num(s.tiers[0].minKg) });
        else if (mine.some((m) => m.q.reason === 'over_budget')) msg = t('m_f_price');
        else if (mine.some((m) => m.q.reason === 'short_supply')) msg = t('m_f_stock');
        tracks.push({
          id: s.id,
          // A listing posted without a variety uses the fruit name as its variety: don't say it twice.
          title: pick(s.variety, lang) === fruit(s.fruit) ? fruit(s.fruit) : `${fruit(s.fruit)} ${pick(s.variety, lang)}`,
          sub: `${t('available')} ${num(s.qtyKg)} ${t('kg')} · ${date(s.availableFrom)} – ${date(s.availableTo)}`,
          steps,
          current: 1,
          tone: 'wait',
          msg,
          link: { label: t('l_see_board'), to: '/board' },
        });
      }
    }

    tracks.sort((a, b) => ORDER[a.tone] - ORDER[b.tone]);
    return { tracks, done };
  }, [state, me, t, lang, num, userById, pools, dealNext]);
}
