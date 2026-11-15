import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppState, Charge, Deal, Demand, Lang, Supply, User } from './types';
import { STATE_VERSION, seedState } from './seed';
import { addDays, signedDays, today } from './lib/dates';
import { round2, type Quote } from './lib/pool';
import { translate, type Key } from './i18n';

const KEY = 'fruitpool-demo';
const LANG_KEY = 'fruitpool-lang';

/** Keep demo dates relative to today, so a pitch a week later still shows live pools. */
function shiftDates(s: AppState): AppState {
  const delta = signedDays(s.anchor, today());
  if (delta <= 0) return s;
  const shiftIso = (iso: string) => {
    const d = new Date(iso);
    d.setDate(d.getDate() + delta);
    return d.toISOString();
  };
  return {
    ...s,
    anchor: today(),
    demands: s.demands.map((d) => ({ ...d, neededBy: addDays(d.neededBy, delta) })),
    supplies: s.supplies.map((x) => ({
      ...x,
      availableFrom: addDays(x.availableFrom, delta),
      availableTo: addDays(x.availableTo, delta),
      featuredUntil: x.featuredUntil && addDays(x.featuredUntil, delta),
      verify: x.verify && {
        ...x.verify,
        requestedAt: shiftIso(x.verify.requestedAt),
        verifiedAt: x.verify.verifiedAt && shiftIso(x.verify.verifiedAt),
      },
    })),
    deals: s.deals.map((d) => ({ ...d, deliveryDate: addDays(d.deliveryDate, delta), events: d.events.map((e) => ({ ...e, at: shiftIso(e.at) })) })),
    charges: s.charges.map((c) => ({ ...c, at: shiftIso(c.at) })),
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as AppState;
      if (s.version === STATE_VERSION) {
        // Data saved before a region existed has no shipping rate for it: fill in the missing ones.
        s.settings.shipping = { ...seedState().settings.shipping, ...s.settings.shipping };
        return shiftDates(s);
      }
    }
  } catch {
    /* storage blocked or corrupt: fall back to seed */
  }
  return seedState();
}

function loadLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'th';
  } catch {
    return 'th';
  }
}

const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
const now = () => new Date().toISOString();

/** Charge the farmer for an add-on and record it in FRUITPOOL's income. */
function charge(s: AppState, sup: Supply, kind: Charge['kind']) {
  const amount = kind === 'verify' ? s.settings.verifyFee : s.settings.featureFee;
  s.charges.push({ id: uid('c'), at: now(), farmerId: sup.farmerId, supplyId: sup.id, kind, amount });
}

/** Ask for grade verification. Ignored if the listing already has one requested or done. */
function startVerify(s: AppState, sup: Supply) {
  if (sup.verify) return;
  sup.verify = { status: 'pending', requestedAt: now() };
  charge(s, sup, 'verify');
}

/** Promote a listing. A renewal extends from the current end date, not from today. */
function startFeature(s: AppState, sup: Supply) {
  const live = sup.featuredUntil && sup.featuredUntil >= today();
  sup.featuredUntil = addDays(live ? sup.featuredUntil! : addDays(today(), -1), s.settings.featureDays);
  charge(s, sup, 'feature');
}

function finishIfAllReceived(deal: Deal, demands: Demand[]) {
  if (deal.lines.every((l) => l.received)) {
    deal.status = 'completed';
    deal.events.push({ at: now(), key: 'ev_completed' });
    for (const l of deal.lines) {
      const d = demands.find((x) => x.id === l.demandId);
      if (d) d.status = 'done';
    }
  }
}

function lockIfAllConfirmed(s: AppState, deal: Deal) {
  if (deal.status === 'awaiting' && deal.lines.every((l) => l.confirmed)) {
    deal.status = 'confirmed';
    deal.events.push({ at: now(), key: 'ev_all_confirmed' });
    const sup = s.supplies.find((x) => x.id === deal.supplyId);
    if (sup) sup.qtyKg = Math.max(0, sup.qtyKg - deal.totalKg);
  }
}

function useAppState() {
  const [state, setState] = useState<AppState>(load);
  const [lang, setLangState] = useState<Lang>(loadLang);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const mutate = useCallback((fn: (draft: AppState) => void) => {
    setState((prev) => {
      const draft = structuredClone(prev);
      fn(draft);
      return draft;
    });
  }, []);

  const withDeal = (id: string, fn: (deal: Deal, s: AppState) => void) =>
    mutate((s) => {
      const deal = s.deals.find((d) => d.id === id);
      if (deal) fn(deal, s);
    });

  const me = state.users.find((u) => u.id === state.currentUserId)!;

  const actions = {
    setLang: setLangState,
    setUser: (id: string) => mutate((s) => void (s.currentUserId = id)),
    reset: () => {
      const seed = seedState();
      // A joined account is not in the seed, so fall back to the seed's default viewer.
      const keep = seed.users.some((u) => u.id === state.currentUserId);
      setState(keep ? { ...seed, currentUserId: state.currentUserId } : seed);
    },

    /** Demo sign-up: no password, the account lives in this browser and becomes the current viewer. Returns its id. */
    addUser: (u: Omit<User, 'id'>) => {
      const id = uid(u.role === 'buyer' ? 'b' : 'f');
      mutate((s) => {
        s.users.push({ ...u, id });
        s.currentUserId = id;
      });
      return id;
    },

    /** Returns the new demand's id. */
    addDemand: (d: Omit<Demand, 'id' | 'status' | 'buyerId'>) => {
      const id = uid('d');
      mutate((s) => void s.demands.push({ ...d, id, buyerId: s.currentUserId, status: 'open' }));
      return id;
    },

    /** Returns the new listing's id. Optional paid add-ons are charged with it. */
    addSupply: (x: Omit<Supply, 'id' | 'farmerId' | 'region'>, addons: { verify?: boolean; feature?: boolean } = {}) => {
      const id = uid('s');
      mutate((s) => {
        const u = s.users.find((y) => y.id === s.currentUserId)!;
        const sup: Supply = { ...x, id, farmerId: u.id, region: u.region ?? 'central' };
        s.supplies.push(sup);
        if (addons.verify) startVerify(s, sup);
        if (addons.feature) startFeature(s, sup);
      });
      return id;
    },

    /** Paid add-ons on an existing listing. Only its owner can buy them. */
    requestVerify: (supplyId: string) =>
      mutate((s) => {
        const sup = s.supplies.find((x) => x.id === supplyId);
        if (sup && sup.farmerId === s.currentUserId) startVerify(s, sup);
      }),
    featureListing: (supplyId: string) =>
      mutate((s) => {
        const sup = s.supplies.find((x) => x.id === supplyId);
        if (sup && sup.farmerId === s.currentUserId) startFeature(s, sup);
      }),
    /** Demo shortcut: the inspector visits and confirms the grade. */
    approveVerify: (supplyId: string) =>
      mutate((s) => {
        const sup = s.supplies.find((x) => x.id === supplyId);
        if (sup?.verify?.status === 'pending') sup.verify = { ...sup.verify, status: 'verified', verifiedAt: now() };
      }),

    /** Farmer locks the quoted terms and offers them to the shops in the pool. */
    sendOffer: (q: Quote, pool: { zone: Deal['zone']; deliveryDate: string }) => {
      const id = uid('deal');
      mutate((s) => {
        const ids = q.included.map((l) => l.demand.id);
        for (const d of s.demands) if (ids.includes(d.id)) d.status = 'in_deal';
        s.deals.unshift({
          id,
          supplyId: q.supply.id,
          farmerId: q.supply.farmerId,
          fruit: q.supply.fruit,
          grade: q.supply.grade,
          zone: pool.zone,
          deliveryDate: pool.deliveryDate,
          lines: q.included.map((l) => ({ demandId: l.demand.id, buyerId: l.demand.buyerId, qtyKg: l.demand.qtyKg, confirmed: false, received: false })),
          totalKg: q.totalKg,
          pricePerKg: q.price!,
          shippingPerKg: q.ship!,
          feePerKg: q.fee,
          status: 'awaiting',
          events: [{ at: now(), key: 'ev_offered', by: q.supply.farmerId }],
        });
      });
      return id;
    },

    confirmLine: (dealId: string, buyerId: string) =>
      withDeal(dealId, (deal, s) => {
        // A shop may have more than one order in the deal: "Confirm my order" covers all of them.
        const lines = deal.lines.filter((l) => l.buyerId === buyerId && !l.confirmed);
        if (lines.length === 0 || deal.status !== 'awaiting') return;
        for (const l of lines) l.confirmed = true;
        deal.events.push({ at: now(), key: 'ev_confirmed_line', by: buyerId });
        lockIfAllConfirmed(s, deal);
      }),

    ship: (dealId: string) =>
      withDeal(dealId, (deal) => {
        if (deal.status !== 'confirmed') return;
        deal.status = 'shipped';
        deal.events.push({ at: now(), key: 'ev_shipped', by: deal.farmerId });
      }),

    receive: (dealId: string, buyerId: string) =>
      withDeal(dealId, (deal, s) => {
        const lines = deal.lines.filter((l) => l.buyerId === buyerId && !l.received);
        if (lines.length === 0 || deal.status !== 'shipped') return;
        for (const l of lines) l.received = true;
        deal.events.push({ at: now(), key: 'ev_received', by: buyerId });
        finishIfAllReceived(deal, s.demands);
      }),

    dispute: (dealId: string, buyerId: string, note: string) =>
      withDeal(dealId, (deal) => {
        if (deal.status !== 'shipped') return;
        deal.status = 'disputed';
        deal.events.push({ at: now(), key: 'ev_disputed', by: buyerId, note });
      }),

    resolve: (dealId: string) =>
      withDeal(dealId, (deal, s) => {
        if (deal.status !== 'disputed') return;
        deal.events.push({ at: now(), key: 'ev_resolved' });
        deal.status = 'shipped';
        for (const l of deal.lines) l.received = true;
        finishIfAllReceived(deal, s.demands);
      }),

    withdraw: (dealId: string) =>
      withDeal(dealId, (deal, s) => {
        if (deal.status !== 'awaiting') return;
        deal.status = 'cancelled';
        deal.events.push({ at: now(), key: 'ev_cancelled', by: deal.farmerId });
        for (const l of deal.lines) {
          const d = s.demands.find((x) => x.id === l.demandId);
          if (d) d.status = 'open';
        }
      }),

    /** Demo shortcut: the other shops in the deal take their next step. */
    actForOthers: (dealId: string) =>
      withDeal(dealId, (deal, s) => {
        const others = deal.lines.filter((l) => l.buyerId !== s.currentUserId);
        if (deal.status === 'awaiting') {
          for (const l of others.filter((x) => !x.confirmed)) {
            l.confirmed = true;
            deal.events.push({ at: now(), key: 'ev_confirmed_line', by: l.buyerId });
          }
          lockIfAllConfirmed(s, deal);
        } else if (deal.status === 'confirmed' && deal.farmerId !== s.currentUserId) {
          deal.status = 'shipped';
          deal.events.push({ at: now(), key: 'ev_shipped', by: deal.farmerId });
        } else if (deal.status === 'shipped') {
          for (const l of others.filter((x) => !x.received)) {
            l.received = true;
            deal.events.push({ at: now(), key: 'ev_received', by: l.buyerId });
          }
          finishIfAllReceived(deal, s.demands);
        }
      }),
  };

  const t = useCallback((key: Key, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang]);
  const userById = useMemo(() => {
    const m = new Map<string, User>();
    for (const u of state.users) m.set(u.id, u);
    return (id: string) => m.get(id)!;
  }, [state.users]);
  const num = useCallback(
    (n: number) => round2(n).toLocaleString(lang === 'th' ? 'th-TH' : 'en-GB', { maximumFractionDigits: 2 }),
    [lang],
  );

  return { state, lang, me, t, num, userById, ...actions };
}

type Ctx = ReturnType<typeof useAppState>;
const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const value = useAppState();
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const v = useContext(AppCtx);
  if (!v) throw new Error('useApp outside provider');
  return v;
}
