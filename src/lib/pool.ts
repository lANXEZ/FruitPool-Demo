import type { Demand, Grade, Purpose, Settings, Supply } from '../types';
import { daysBetween } from './dates';

/** Quality-to-Purpose: which grades fit each kind of use. */
export const PURPOSE_GRADES: Record<Purpose, Grade[]> = {
  fresh: ['A'],
  juice: ['A', 'B'],
  smoothie: ['A', 'B', 'C'],
  processing: ['B', 'C'],
};

export interface Pool {
  id: string;
  fruit: Demand['fruit'];
  zone: Demand['zone'];
  grades: Grade[];
  deliveryDate: string; // earliest neededBy in the pool
  demands: Demand[];
  totalKg: number;
}

const intersect = (a: Grade[], b: Grade[]) => a.filter((g) => b.includes(g));

/**
 * Conditional demand pooling. Open demands join the same pool only when they share
 * fruit and delivery zone, their delivery dates fall within the window, and at least
 * one quality grade suits every member's purpose.
 */
export function buildPools(demands: Demand[], settings: Settings): Pool[] {
  const open = demands
    .filter((d) => d.status === 'open')
    .sort((a, b) => a.neededBy.localeCompare(b.neededBy) || a.id.localeCompare(b.id));
  const pools: Pool[] = [];
  for (const d of open) {
    const grades = PURPOSE_GRADES[d.purpose];
    const fit = pools.find(
      (p) =>
        p.fruit === d.fruit &&
        p.zone === d.zone &&
        daysBetween(p.deliveryDate, d.neededBy) <= settings.poolWindowDays &&
        intersect(p.grades, grades).length > 0,
    );
    if (fit) {
      fit.demands.push(d);
      fit.grades = intersect(fit.grades, grades);
      fit.totalKg += d.qtyKg;
    } else {
      pools.push({ id: '', fruit: d.fruit, zone: d.zone, grades: [...grades], deliveryDate: d.neededBy, demands: [d], totalKg: d.qtyKg });
    }
  }
  for (const p of pools) p.id = p.demands.map((d) => d.id).join('+');
  return pools;
}

/** Farmer-controlled bulk pricing: the best tier the volume qualifies for, or null if below the minimum. */
export function tierFor(supply: Supply, kg: number) {
  let tier = null;
  for (const t of supply.tiers) if (kg >= t.minKg) tier = t;
  return tier;
}

export function nextTier(supply: Supply, kg: number) {
  return supply.tiers.find((t) => t.minKg > kg) ?? null;
}

export function shippingPerKg(supply: Supply, kg: number, settings: Settings) {
  const s = settings.shipping[supply.region];
  return round2(s.trip / kg + s.perKg);
}

/** Landed cost per kg (fruit + shipping + platform fee) for a given volume, or null below the farmer's minimum. */
export function landedCost(supply: Supply, kg: number, settings: Settings) {
  const tier = tierFor(supply, kg);
  if (!tier) return null;
  const ship = shippingPerKg(supply, kg, settings);
  return { price: tier.price, ship, fee: settings.feePerKg, landed: round2(tier.price + ship + settings.feePerKg) };
}

export interface LineQuote {
  demand: Demand;
  withinBudget: boolean;
  /** Landed cost if this buyer ordered alone from the same farmer (null: below minimum order). */
  solo: number | null;
}

export type Unviable = 'below_min' | 'over_budget' | 'short_supply';

export interface Quote {
  supply: Supply;
  included: LineQuote[];
  excluded: LineQuote[];
  totalKg: number;
  price: number | null;
  ship: number | null;
  fee: number;
  landed: number | null;
  /** Landed cost if the whole pool bought together (shown when the quote is not viable). */
  fullLanded: number | null;
  kgToMin: number; // how many more kg needed to reach the farmer's minimum
  next: { minKg: number; price: number } | null;
  viable: boolean;
  reason?: Unviable;
}

export function supplyFits(pool: Pool, s: Supply) {
  return (
    s.fruit === pool.fruit &&
    pool.grades.includes(s.grade) &&
    s.qtyKg > 0 &&
    s.availableFrom <= pool.deliveryDate &&
    pool.deliveryDate <= s.availableTo
  );
}

/**
 * Price a pool against one farmer listing. Members whose budget is below the landed
 * cost drop out, and the price is recalculated for the smaller volume (which may push
 * the pool below a tier or the minimum). Never prices below the farmer's own tiers.
 */
export function quotePool(pool: Pool, supply: Supply, settings: Settings): Quote {
  let members = [...pool.demands];
  const excluded: Demand[] = [];
  let cost = null as ReturnType<typeof landedCost>;
  let reason: Unviable | undefined;

  for (;;) {
    const total = members.reduce((s, d) => s + d.qtyKg, 0);
    if (members.length === 0) {
      reason = 'over_budget';
      break;
    }
    cost = landedCost(supply, total, settings);
    if (!cost) {
      reason = 'below_min';
      break;
    }
    const over = members.filter((d) => d.maxCost < cost!.landed);
    if (over.length === 0) break;
    excluded.push(...over);
    members = members.filter((d) => !over.includes(d));
  }

  const totalKg = members.reduce((s, d) => s + d.qtyKg, 0);
  if (!reason && totalKg > supply.qtyKg) reason = 'short_supply';
  const solo = (d: Demand) => landedCost(supply, d.qtyKg, settings)?.landed ?? null;
  const viable = !reason;
  // When unviable, show the full pool so buyers see what is missing.
  const shownKg = viable ? totalKg : pool.totalKg;

  return {
    supply,
    included: (viable ? members : pool.demands).map((d) => ({ demand: d, withinBudget: viable, solo: solo(d) })),
    excluded: viable ? excluded.map((d) => ({ demand: d, withinBudget: false, solo: solo(d) })) : [],
    totalKg: shownKg,
    price: viable ? cost!.price : null,
    ship: viable ? cost!.ship : null,
    fee: settings.feePerKg,
    landed: viable ? cost!.landed : null,
    fullLanded: landedCost(supply, pool.totalKg, settings)?.landed ?? null,
    kgToMin: Math.max(0, supply.tiers[0].minKg - totalKg),
    next: nextTier(supply, shownKg),
    viable,
    reason,
  };
}

/** All farmer listings that fit a pool, best first (viable, then cheapest landed cost). */
export function quotesForPool(pool: Pool, supplies: Supply[], settings: Settings): Quote[] {
  return supplies
    .filter((s) => supplyFits(pool, s))
    .map((s) => quotePool(pool, s, settings))
    .sort((a, b) => Number(b.viable) - Number(a.viable) || (a.landed ?? 1e9) - (b.landed ?? 1e9) || a.kgToMin - b.kgToMin);
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}
