import type { FruitId } from './catalog';

export type { FruitId };
export type Lang = 'th' | 'en';
export type L = { th: string; en: string };

export type Role = 'buyer' | 'farmer';
export type Purpose = 'fresh' | 'juice' | 'smoothie' | 'processing';
export type Grade = 'A' | 'B' | 'C';
export type ZoneId = 'ari' | 'sukhumvit' | 'bangna' | 'nonthaburi';
export type RegionId = 'central' | 'east' | 'north' | 'northeast';

export interface User {
  id: string;
  role: Role;
  name: L;
  kind: L; // e.g. "Juice bar", "Orchard"
  zone?: ZoneId; // buyers deliver here
  region?: RegionId; // farmers ship from here
}

export interface Demand {
  id: string;
  buyerId: string;
  fruit: FruitId;
  qtyKg: number;
  purpose: Purpose;
  /** Max acceptable LANDED cost per kg (fruit + shipping + fee). */
  maxCost: number;
  /** What the buyer pays today, landed, for comparison. Optional. */
  currentCost?: number;
  zone: ZoneId;
  neededBy: string; // YYYY-MM-DD
  status: 'open' | 'in_deal' | 'done';
}

export interface PriceTier {
  minKg: number;
  price: number; // fruit price ฿/kg at this volume
}

export interface Supply {
  id: string;
  farmerId: string;
  fruit: FruitId;
  variety: L;
  grade: Grade;
  qtyKg: number;
  tiers: PriceTier[]; // ascending by minKg; tiers[0].minKg is the minimum order
  region: RegionId;
  availableFrom: string;
  availableTo: string;
}

export type DealStatus = 'awaiting' | 'confirmed' | 'shipped' | 'completed' | 'disputed' | 'cancelled';

export interface DealLine {
  demandId: string;
  buyerId: string;
  qtyKg: number;
  confirmed: boolean;
  received: boolean;
}

export interface DealEvent {
  at: string; // ISO datetime
  key: string; // i18n key
  by?: string; // user id
  note?: string;
}

export interface Deal {
  id: string;
  supplyId: string;
  farmerId: string;
  fruit: FruitId;
  grade: Grade;
  zone: ZoneId;
  deliveryDate: string;
  lines: DealLine[];
  totalKg: number;
  pricePerKg: number;
  shippingPerKg: number;
  feePerKg: number;
  status: DealStatus;
  events: DealEvent[];
}

export interface Settings {
  feePerKg: number;
  /** Shipping to Bangkok-area zones: fixed cost per truck trip + variable cost per kg. */
  shipping: Record<RegionId, { trip: number; perKg: number }>;
  /** Max days between delivery dates of orders in the same pool. */
  poolWindowDays: number;
}

export interface AppState {
  version: number;
  anchor: string; // date the dates are relative to; shifted forward on load
  currentUserId: string;
  users: User[];
  demands: Demand[];
  supplies: Supply[];
  deals: Deal[];
  settings: Settings;
}
