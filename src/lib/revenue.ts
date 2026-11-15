import type { AppState, Supply } from '../types';
import { today } from './dates';
import { round2 } from './pool';

export const isVerified = (s: Supply) => s.verify?.status === 'verified';
/** A promotion is live through its end date. */
export const isFeatured = (s: Supply) => !!s.featuredUntil && s.featuredUntil >= today();

export type Stream = 'deal' | 'verify' | 'feature';

export interface LedgerRow {
  id: string;
  at: string; // ISO datetime
  stream: Stream;
  farmerId: string;
  /** deal: kg traded; add-ons: the listing */
  kg?: number;
  supplyId: string;
  amount: number;
}

/**
 * FRUITPOOL's income, computed from the demo data. Deal fees count once a deal completes
 * (fee per kg × kg); deals still in progress are shown apart as income to come, and cancelled
 * deals earn nothing. Add-on fees count when the farmer buys them. The ledger sums to the total.
 */
export function revenue(state: AppState) {
  const ledger: LedgerRow[] = [];
  for (const d of state.deals) {
    if (d.status !== 'completed') continue;
    const done = d.events.find((e) => e.key === 'ev_completed')?.at ?? `${d.deliveryDate}T12:00:00`;
    ledger.push({ id: d.id, at: done, stream: 'deal', farmerId: d.farmerId, kg: d.totalKg, supplyId: d.supplyId, amount: round2(d.feePerKg * d.totalKg) });
  }
  for (const c of state.charges) {
    ledger.push({ id: c.id, at: c.at, stream: c.kind, farmerId: c.farmerId, supplyId: c.supplyId, amount: c.amount });
  }
  // Compare as dates: seeded times are local, new ones are UTC ISO strings.
  ledger.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const sum = (stream: Stream) => {
    const rows = ledger.filter((r) => r.stream === stream);
    return { amount: round2(rows.reduce((s, r) => s + r.amount, 0)), count: rows.length, kg: rows.reduce((s, r) => s + (r.kg ?? 0), 0) };
  };
  const inProgress = state.deals.filter((d) => ['awaiting', 'confirmed', 'shipped', 'disputed'].includes(d.status));

  return {
    ledger,
    deal: sum('deal'),
    verify: sum('verify'),
    feature: sum('feature'),
    total: round2(ledger.reduce((s, r) => s + r.amount, 0)),
    toCome: { amount: round2(inProgress.reduce((s, d) => s + d.feePerKg * d.totalKg, 0)), count: inProgress.length },
  };
}
