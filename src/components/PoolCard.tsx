import { useNavigate } from 'react-router-dom';
import { Send, Truck } from 'lucide-react';
import { useApp } from '../store';
import { pick } from '../i18n';
import { FRUITS, PURPOSES, REGIONS, ZONES } from '../catalog';
import { fmtDate } from '../lib/dates';
import { round2, type Pool, type Quote } from '../lib/pool';

export function GradeTag({ g }: { g: string }) {
  return <span className="grade">{g}</span>;
}

export default function PoolCard({ pool, quotes }: { pool: Pool; quotes: Quote[] }) {
  const { lang, t, num, me, userById, sendOffer } = useApp();
  const navigate = useNavigate();
  const best = quotes[0];
  const included = new Set(best?.included.map((l) => l.demand.id));
  const viable = best?.viable ?? false;

  const status = !best ? (
    <span className="badge plain">{t('no_match')}</span>
  ) : viable ? (
    <span className="badge ok">{t('viable')}</span>
  ) : (
    <span className="badge wait">{reasonText(best)}</span>
  );

  function reasonText(q: Quote) {
    if (q.reason === 'below_min') return t('why_below_min', { n: num(q.kgToMin) });
    if (q.reason === 'over_budget') return t('why_over_budget');
    return t('why_short_supply');
  }

  // Volume meter: pooled kg against the farmer's tier thresholds.
  const tiers = best?.supply.tiers ?? [];
  const scaleMax = Math.max(pool.totalKg, tiers.at(-1)?.minKg ?? 0) * 1.15 || 1;
  const pct = (kg: number) => `${Math.min(100, (kg / scaleMax) * 100)}%`;

  const offer = () => {
    if (!best) return;
    const id = sendOffer(best, pool);
    navigate(`/deals#${id}`);
  };

  return (
    <article className={`pool ${viable ? 'is-viable' : 'is-waiting'}`}>
      <header className="pool-head">
        <h2>{pick(FRUITS[pool.fruit], lang)}</h2>
        <span className="row small muted">
          <Truck size={15} aria-hidden /> {pick(ZONES[pool.zone], lang)} · {t('delivery')} {fmtDate(pool.deliveryDate, lang)}
        </span>
        <span className="row small">
          {t('accepts')} {pool.grades.map((g) => <GradeTag key={g} g={g} />)}
        </span>
        <span className="small">
          {t('total')} <span className="num">{num(pool.totalKg)}</span> {t('kg')}
        </span>
        <span style={{ marginLeft: 'auto' }}>{status}</span>
      </header>

      <div className="pool-body">
        <section>
          <h3>{t('pool_orders')}</h3>
          {best && (
            <>
              <div className="meter" aria-hidden>
                <i style={{ width: pct(viable ? best.totalKg : pool.totalKg) }} />
                {tiers.map((tr) => <b key={tr.minKg} style={{ left: pct(tr.minKg) }} />)}
              </div>
              <div className="ladder">
                {tiers.map((tr) => (
                  <div key={tr.minKg} className={best.price === tr.price ? 'hit' : ''}>
                    <span className="num">{num(tr.price)}</span> {t('per_kg')}
                    <small>≥ {num(tr.minKg)} {t('kg')}</small>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table>
              <thead>
                <tr>
                  <th>{t('col_shop')}</th>
                  <th className="r">{t('kg')}</th>
                  <th className="r">{t('limit')}</th>
                  <th className="r">{t('col_alone')}</th>
                  <th className="r">{t('col_now')}</th>
                  <th className="r">{t('col_diff')}</th>
                </tr>
              </thead>
              <tbody>
                {pool.demands.map((d) => {
                  const out = viable && !included.has(d.id);
                  const solo = best?.included.concat(best.excluded).find((l) => l.demand.id === d.id)?.solo ?? null;
                  const diff = viable && !out && d.currentCost != null ? round2(d.currentCost - best!.landed!) : null;
                  return (
                    <tr key={d.id} className={`${d.buyerId === me.id ? 'mine' : ''} ${out ? 'out' : ''}`}>
                      <td>
                        {pick(userById(d.buyerId).name, lang)}
                        <div className="small muted">
                          {pick(PURPOSES[d.purpose], lang)}
                          {d.buyerId === me.id && <> · {t('your_order')}</>}
                        </div>
                        {out && <div className="small lose" style={{ textDecoration: 'none' }}>{t('dropped')}</div>}
                      </td>
                      <td className="r num">{num(d.qtyKg)}</td>
                      <td className="r num">{num(d.maxCost)}</td>
                      <td className="r">{best ? solo == null ? <span className="small muted">{t('below_min_short')}</span> : <span className="num">{num(solo)}</span> : '–'}</td>
                      <td className="r num">{d.currentCost != null ? num(d.currentCost) : '–'}</td>
                      <td className="r">
                        {diff == null ? '–' : <span className={`num ${diff >= 0 ? 'save' : 'lose'}`}>{diff >= 0 ? '−' : '+'}{num(Math.abs(diff))}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          {!best ? (
            <p className="muted">{t('no_match')}</p>
          ) : (
            <>
              <div className="small muted">{t('best_match')}</div>
              <h3>{pick(userById(best.supply.farmerId).name, lang)}</h3>
              <div className="row small muted">
                {pick(best.supply.variety, lang)} <GradeTag g={best.supply.grade} /> · {t('ships_from')} {pick(REGIONS[best.supply.region], lang)}
              </div>

              {viable ? (
                <div className="costs">
                  <div><span>{t('cost_fruit')} <span className="muted small">({num(best.totalKg)} {t('kg')})</span></span><span className="num">{num(best.price!)}</span></div>
                  <div><span>{t('cost_ship')}</span><span className="num">{num(best.ship!)}</span></div>
                  <div><span>{t('cost_fee')}</span><span className="num">{num(best.fee)}</span></div>
                  <div className="total"><span>{t('cost_landed')}</span><span><span className="num">{num(best.landed!)}</span> {t('per_kg')}</span></div>
                </div>
              ) : (
                <div className="costs">
                  <div><span>{reasonText(best)}</span></div>
                  {best.fullLanded != null && (
                    <div><span>{t('cost_landed')}</span><span><span className="num">{num(best.fullLanded)}</span> {t('per_kg')}</span></div>
                  )}
                </div>
              )}

              {viable && best.next && (
                <p className="small" style={{ marginTop: 8 }}>
                  {t('next_tier', { n: num(best.next.minKg - best.totalKg), p: num(best.next.price) })}
                </p>
              )}

              {viable && (
                <div className="actions">
                  {me.id === best.supply.farmerId ? (
                    <button className="btn mango" onClick={offer}><Send size={16} aria-hidden /> {t('send_offer')}</button>
                  ) : (
                    <p className="small muted">{t('offer_hint_other', { farmer: pick(userById(best.supply.farmerId).name, lang) })}</p>
                  )}
                </div>
              )}

              {quotes.length > 1 && (
                <details className="others">
                  <summary>{t('other_listings')} ({quotes.length - 1})</summary>
                  {quotes.slice(1).map((q) => (
                    <div className="other-row" key={q.supply.id}>
                      <span>
                        {pick(userById(q.supply.farmerId).name, lang)} <GradeTag g={q.supply.grade} />{' '}
                        <span className="muted">{pick(REGIONS[q.supply.region], lang)}</span>
                      </span>
                      <span>
                        {q.viable ? (
                          <><span className="num">{num(q.landed!)}</span> {t('per_kg')} {t('landed_short')}</>
                        ) : (
                          <span className="small lose">
                            {reasonText(q)}
                            {q.fullLanded != null && <> (<span className="num">{num(q.fullLanded)}</span>)</>}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </details>
              )}
            </>
          )}
        </section>
      </div>
    </article>
  );
}
