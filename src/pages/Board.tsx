import { useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { useApp } from '../store';
import { pick } from '../i18n';
import { FRUITS, PURPOSES, REGIONS, ZONES } from '../catalog';
import { addDays, fmtDate, today } from '../lib/dates';
import { GradeTag } from '../components/PoolCard';
import FruitPicker from '../components/FruitPicker';
import type { FruitId, Grade, Purpose, ZoneId } from '../types';

export default function Board() {
  const { state, lang, t, num, me, userById } = useApp();
  const [fruit, setFruit] = useState<FruitId | 'all'>('all');
  const [form, setForm] = useState<'demand' | 'supply' | null>(null);

  const match = (f: FruitId) => fruit === 'all' || f === fruit;
  const demands = state.demands.filter((d) => d.status !== 'done' && match(d.fruit)).sort((a, b) => a.neededBy.localeCompare(b.neededBy));
  const supplies = state.supplies.filter((s) => s.qtyKg > 0 && match(s.fruit));
  // One chip per fruit that has posts (the full list is too long for a chip row).
  const onBoard = new Set<FruitId>([
    ...state.demands.filter((d) => d.status !== 'done').map((d) => d.fruit),
    ...state.supplies.filter((s) => s.qtyKg > 0).map((s) => s.fruit),
  ]);
  if (fruit !== 'all') onBoard.add(fruit);
  const chipFruits = [...onBoard].sort((a, b) => pick(FRUITS[a], lang).localeCompare(pick(FRUITS[b], lang), lang));
  const statusBadge = (s: string) =>
    s === 'open' ? <span className="badge wait">{t('st_open')}</span> : <span className="badge ok">{t('st_in_deal')}</span>;

  return (
    <>
      <div className="page-head">
        <h1>{t('nav_board')}</h1>
      </div>

      <div className="spread" style={{ marginBottom: 16 }}>
        <div className="row" role="group">
          <button className="chip" aria-pressed={fruit === 'all'} onClick={() => setFruit('all')}>{t('all_fruit')}</button>
          {chipFruits.map((f) => (
            <button key={f} className="chip" aria-pressed={fruit === f} onClick={() => setFruit(f)}>{pick(FRUITS[f], lang)}</button>
          ))}
        </div>
        {me.role === 'buyer' ? (
          <button className="btn" onClick={() => setForm(form === 'demand' ? null : 'demand')}><Plus size={16} aria-hidden /> {t('post_demand')}</button>
        ) : (
          <button className="btn" onClick={() => setForm(form === 'supply' ? null : 'supply')}><Plus size={16} aria-hidden /> {t('post_supply')}</button>
        )}
      </div>

      {form === 'demand' && me.role === 'buyer' && <DemandForm onDone={() => setForm(null)} />}
      {form === 'supply' && me.role === 'farmer' && <SupplyForm onDone={() => setForm(null)} />}

      <div className="board">
        <section className="panel">
          <h2>{t('board_demand')}</h2>
          {demands.length === 0 && <p className="empty">{t('empty_board')}</p>}
          {demands.map((d) => (
            <div key={d.id} className={`listing ${d.buyerId === me.id ? 'mine' : ''}`}>
              <div>
                <span className="who">{pick(userById(d.buyerId).name, lang)}</span>{' '}
                <span className="muted small">{pick(userById(d.buyerId).kind, lang)}</span>
              </div>
              <div>{statusBadge(d.status)}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>{pick(FRUITS[d.fruit], lang)}</strong> <span className="num">{num(d.qtyKg)}</span> {t('kg')} · {pick(PURPOSES[d.purpose], lang)}
              </div>
              <div className="meta">
                <span>{pick(ZONES[d.zone], lang)}</span>
                <span>{t('needed_by')} {fmtDate(d.neededBy, lang)}</span>
                <span>{t('limit')} <span className="num">{num(d.maxCost)}</span> {t('per_kg')}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>{t('board_supply')}</h2>
          {supplies.length === 0 && <p className="empty">{t('empty_board')}</p>}
          {supplies.map((s) => (
            <div key={s.id} className={`listing ${s.farmerId === me.id ? 'mine' : ''}`}>
              <div>
                <span className="who">{pick(userById(s.farmerId).name, lang)}</span>{' '}
                <span className="muted small">{t('ships_from')} {pick(REGIONS[s.region], lang)}</span>
              </div>
              <div><GradeTag g={s.grade} /></div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>{pick(FRUITS[s.fruit], lang)}</strong> {pick(s.variety, lang)} · {t('available')} <span className="num">{num(s.qtyKg)}</span> {t('kg')}
              </div>
              <div className="tiers-inline">
                {s.tiers.map((tr) => (
                  <span key={tr.minKg}>≥{num(tr.minKg)} {t('kg')}: <b className="num">{num(tr.price)}</b> {t('per_kg')}</span>
                ))}
              </div>
              <div className="meta">
                <span>{t('min_order')} {num(s.tiers[0].minKg)} {t('kg')}</span>
                <span>{fmtDate(s.availableFrom, lang)} – {fmtDate(s.availableTo, lang)}</span>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

function DemandForm({ onDone }: { onDone: () => void }) {
  const { lang, t, me, addDemand } = useApp();
  const [f, setF] = useState({
    fruit: 'mango' as FruitId, qtyKg: 30, purpose: 'juice' as Purpose, maxCost: 58, currentCost: '' as number | '',
    zone: (me.zone ?? 'ari') as ZoneId, neededBy: addDays(today(), 5),
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF({ ...f, [k]: v });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    addDemand({ ...f, currentCost: f.currentCost === '' ? undefined : f.currentCost });
    onDone();
  };
  return (
    <form className="panel form" style={{ marginBottom: 20 }} onSubmit={submit}>
      <h2 className="full">{t('post_demand')}</h2>
      <div className="field">
        <label htmlFor="df">{t('f_fruit')}</label>
        <FruitPicker id="df" value={f.fruit} onChange={(x) => set('fruit', x)} />
        <span className="hint">{t('f_fruit_hint')}</span>
      </div>
      <div className="field">
        <label htmlFor="dq">{t('f_qty')}</label>
        <input id="dq" type="number" min={1} required value={f.qtyKg} onChange={(e) => set('qtyKg', Number(e.target.value))} />
      </div>
      <div className="field">
        <label htmlFor="dp">{t('f_purpose')}</label>
        <select id="dp" value={f.purpose} onChange={(e) => set('purpose', e.target.value as Purpose)}>
          {(Object.keys(PURPOSES) as Purpose[]).map((x) => <option key={x} value={x}>{pick(PURPOSES[x], lang)}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="dz">{t('f_zone')}</label>
        <select id="dz" value={f.zone} onChange={(e) => set('zone', e.target.value as ZoneId)}>
          {(Object.keys(ZONES) as ZoneId[]).map((x) => <option key={x} value={x}>{pick(ZONES[x], lang)}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="dn">{t('f_needed')}</label>
        <input id="dn" type="date" required min={today()} value={f.neededBy} onChange={(e) => set('neededBy', e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="dm">{t('f_maxcost')}</label>
        <input id="dm" type="number" min={1} step="0.5" required value={f.maxCost} onChange={(e) => set('maxCost', Number(e.target.value))} />
        <span className="hint">{t('f_maxcost_hint')}</span>
      </div>
      <div className="field">
        <label htmlFor="dc">{t('f_current')}</label>
        <input id="dc" type="number" min={0} step="0.5" value={f.currentCost} onChange={(e) => set('currentCost', e.target.value === '' ? '' : Number(e.target.value))} />
        <span className="hint">{t('f_current_hint')}</span>
      </div>
      <div className="full row">
        <button className="btn" type="submit">{t('submit')}</button>
        <button className="btn secondary" type="button" onClick={onDone}>{t('cancel')}</button>
      </div>
    </form>
  );
}

function SupplyForm({ onDone }: { onDone: () => void }) {
  const { lang, t, addSupply } = useApp();
  const [f, setF] = useState({
    fruit: 'mango' as FruitId, variety: '', grade: 'A' as Grade, qtyKg: 200,
    availableFrom: today(), availableTo: addDays(today(), 14),
  });
  const [tiers, setTiers] = useState([{ minKg: 50, price: 50 }, { minKg: 150, price: 46 }]);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF({ ...f, [k]: v });
  const setTier = (i: number, k: 'minKg' | 'price', v: number) => setTiers(tiers.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const clean = tiers.filter((x) => x.minKg > 0 && x.price > 0).sort((a, b) => a.minKg - b.minKg);
    if (clean.length === 0) return;
    const v = f.variety.trim() || pick(FRUITS[f.fruit], lang);
    addSupply({ ...f, variety: { th: v, en: v }, tiers: clean });
    onDone();
  };
  return (
    <form className="panel form" style={{ marginBottom: 20 }} onSubmit={submit}>
      <h2 className="full">{t('post_supply')}</h2>
      <div className="field">
        <label htmlFor="sf">{t('f_fruit')}</label>
        <FruitPicker id="sf" value={f.fruit} onChange={(x) => set('fruit', x)} />
        <span className="hint">{t('f_fruit_hint')}</span>
      </div>
      <div className="field">
        <label htmlFor="sv">{t('f_variety')}</label>
        <input id="sv" value={f.variety} onChange={(e) => set('variety', e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="sg">{t('f_grade')}</label>
        <select id="sg" value={f.grade} onChange={(e) => set('grade', e.target.value as Grade)}>
          {['A', 'B', 'C'].map((g) => <option key={g}>{g}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="sq">{t('f_available')}</label>
        <input id="sq" type="number" min={1} required value={f.qtyKg} onChange={(e) => set('qtyKg', Number(e.target.value))} />
      </div>
      <div className="field">
        <label htmlFor="sa">{t('f_from')}</label>
        <input id="sa" type="date" required value={f.availableFrom} onChange={(e) => set('availableFrom', e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="sb">{t('f_to')}</label>
        <input id="sb" type="date" required min={f.availableFrom} value={f.availableTo} onChange={(e) => set('availableTo', e.target.value)} />
      </div>
      <fieldset className="full" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="small" style={{ fontWeight: 600 }}>{t('f_tiers')}</legend>
        <span className="hint small muted">{t('f_tiers_hint')}</span>
        {tiers.map((tr, i) => (
          <div className="tier-row" key={i}>
            <div className="field">
              <label htmlFor={`tm${i}`}>{t('f_tier_min')}</label>
              <input id={`tm${i}`} type="number" min={1} required value={tr.minKg} onChange={(e) => setTier(i, 'minKg', Number(e.target.value))} />
            </div>
            <div className="field">
              <label htmlFor={`tp${i}`}>{t('f_tier_price')}</label>
              <input id={`tp${i}`} type="number" min={1} step="0.5" required value={tr.price} onChange={(e) => setTier(i, 'price', Number(e.target.value))} />
            </div>
            {tiers.length > 1 && (
              <button type="button" className="btn secondary" aria-label={t('remove')} onClick={() => setTiers(tiers.filter((_, j) => j !== i))}>
                <X size={16} aria-hidden />
              </button>
            )}
          </div>
        ))}
        {tiers.length < 4 && (
          <button type="button" className="btn link" onClick={() => setTiers([...tiers, { minKg: (tiers.at(-1)?.minKg ?? 0) + 100, price: tiers.at(-1)?.price ?? 40 }])}>
            {t('add_tier')}
          </button>
        )}
      </fieldset>
      <div className="full row">
        <button className="btn" type="submit">{t('submit')}</button>
        <button className="btn secondary" type="button" onClick={onDone}>{t('cancel')}</button>
      </div>
    </form>
  );
}
