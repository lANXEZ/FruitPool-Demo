import { useApp } from '../store';
import { pick } from '../i18n';
import { FRUITS, ZONES } from '../catalog';
import { addDays, fmtDate, signedDays, today } from '../lib/dates';
import { GradeTag } from '../components/PoolCard';
import type { FruitId, ZoneId } from '../types';

function sumBy<K extends string>(items: { key: K; kg: number }[]) {
  const m = new Map<K, number>();
  for (const i of items) m.set(i.key, (m.get(i.key) ?? 0) + i.kg);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function Bars({ rows }: { rows: [string, number][] }) {
  const { num, t } = useApp();
  const max = Math.max(1, ...rows.map((r) => r[1]));
  if (rows.length === 0) return <p className="empty">{t('ins_none')}</p>;
  return (
    <div className="bars">
      {rows.map(([label, v]) => (
        <div className="bar" key={label}>
          <span>{label}</span>
          <span className="track"><span className="fill" style={{ display: 'block', width: `${(v / max) * 100}%` }} /></span>
          <span className="num r" style={{ textAlign: 'right' }}>{num(v)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Insights() {
  const { state, lang, t, num } = useApp();
  // Requests (intent) and completed deals (actual trade) are kept strictly apart.
  const requests = state.demands.filter((d) => d.status === 'open');
  const completed = state.deals.filter((d) => d.status === 'completed');
  const reqKg = requests.reduce((s, d) => s + d.qtyKg, 0);
  const doneKg = completed.reduce((s, d) => s + d.totalKg, 0);

  const byFruit = sumBy(requests.map((d) => ({ key: d.fruit, kg: d.qtyKg }))).map(([k, v]) => [pick(FRUITS[k as FruitId], lang), v] as [string, number]);
  const byZone = sumBy(requests.map((d) => ({ key: d.zone, kg: d.qtyKg }))).map(([k, v]) => [pick(ZONES[k as ZoneId], lang), v] as [string, number]);

  const t0 = today();
  const weeks = [0, 1, 2, 3].map((w) => {
    const kg = requests.filter((d) => Math.floor(signedDays(t0, d.neededBy) / 7) === w).reduce((s, d) => s + d.qtyKg, 0);
    return [t('ins_week_of', { d: fmtDate(addDays(t0, w * 7), lang) }), kg] as [string, number];
  });

  // Price range per fruit and grade from completed deals (grades price very differently).
  const prices = new Map<string, number[]>();
  for (const d of completed) {
    const k = `${d.fruit}|${d.grade}`;
    prices.set(k, [...(prices.get(k) ?? []), d.pricePerKg]);
  }
  const allP = [...prices.values()].flat();
  const pMin = Math.min(...allP) * 0.8;
  const pMax = Math.max(...allP) * 1.1;
  const pos = (p: number) => `${((p - pMin) / (pMax - pMin || 1)) * 100}%`;

  return (
    <>
      <div className="page-head">
        <h1>{t('nav_insights')}</h1>
        <p>{t('ins_lede')}</p>
      </div>
      <p className="scope-note">{t('ins_scope')}</p>

      <div className="kpis">
        <div className="kpi req">
          <strong>{t('ins_requests')}</strong> <span className="small muted">{t('ins_requests_sub')}</span>
          <span className="num">{num(reqKg)} {t('kg')}</span>
          <span className="small">{t('requests_n', { n: num(requests.length) })}</span>
        </div>
        <div className="kpi done">
          <strong>{t('ins_completed')}</strong> <span className="small muted">{t('ins_completed_sub')}</span>
          <span className="num">{num(doneKg)} {t('kg')}</span>
          <span className="small">{t('deals_n', { n: num(completed.length) })}</span>
        </div>
      </div>

      <div className="charts">
        <section className="panel"><h3>{t('ins_by_fruit')}</h3><Bars rows={byFruit} /></section>
        <section className="panel"><h3>{t('ins_by_zone')}</h3><Bars rows={byZone} /></section>
        <section className="panel"><h3>{t('ins_by_week')}</h3><Bars rows={weeks} /></section>
        <section className="panel">
          <h3>{t('ins_prices')}</h3>
          {prices.size === 0 && <p className="empty">{t('ins_none')}</p>}
          {[...prices.entries()].sort().map(([key, ps]) => {
            const [fruit, grade] = key.split('|') as [FruitId, string];
            const lo = Math.min(...ps);
            const hi = Math.max(...ps);
            const avg = ps.reduce((a, b) => a + b, 0) / ps.length;
            return (
              <div className="range" key={key}>
                <span>
                  {pick(FRUITS[fruit], lang)} <GradeTag g={grade} />
                  <span className="small muted" style={{ display: 'block' }}>{t('deals_n', { n: ps.length })}</span>
                </span>
                <div>
                  <div className="scale" aria-hidden>
                    <i style={{ left: pos(lo), width: `calc(${pos(hi)} - ${pos(lo)})` }} />
                    <b style={{ left: pos(avg) }} />
                  </div>
                  <div className="small muted">
                    {t('low')} <span className="num">{num(lo)}</span> · {t('avg')} <span className="num">{num(avg)}</span> · {t('high')} <span className="num">{num(hi)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      <p className="future">{t('ins_future')}</p>
    </>
  );
}
