import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Send, Truck } from 'lucide-react';
import { useApp } from '../store';
import { pick } from '../i18n';
import { FRUITS, PURPOSES, REGIONS, ZONES } from '../catalog';
import { fmtDate } from '../lib/dates';
import { round2, type Pool, type Quote } from '../lib/pool';
import Term from './Term';
import ListingTags from './ListingTags';

export function GradeTag({ g }: { g: string }) {
  return <span className="grade">{g}</span>;
}

/**
 * One buying group. The summary answers the viewer's question first (what do I pay / what do I earn,
 * and what happens next); the tiers, member table and cost breakdown sit behind "See details".
 */
export default function PoolCard({ pool, quotes, focus, defaultOpen }: { pool: Pool; quotes: Quote[]; focus?: boolean; defaultOpen?: boolean }) {
  const { lang, t, num, me, userById, sendOffer } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(!!(defaultOpen || focus));
  const best = quotes[0];
  const included = new Set(best?.included.map((l) => l.demand.id));
  const viable = best?.viable ?? false;
  const farmerName = best ? pick(userById(best.supply.farmerId).name, lang) : '';
  const shops = new Set((viable ? best!.included.map((l) => l.demand) : pool.demands).map((d) => d.buyerId)).size;

  const status = !best ? (
    <span className="badge plain">{t('no_match')}</span>
  ) : viable ? (
    <span className="badge ok">{t('viable')}</span>
  ) : (
    // The reason itself is the summary line just below; don't say it twice.
    <span className="badge wait">{t('st_not_ready')}</span>
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
    <article id={pool.id} className={`pool ${viable ? 'is-viable' : 'is-waiting'} ${focus ? 'focus' : ''}`}>
      <header className="pool-head">
        <h2>{pick(FRUITS[pool.fruit], lang)}</h2>
        <span className="row small muted">
          <Truck size={15} aria-hidden /> {pick(ZONES[pool.zone], lang)} · {t('delivery')} {fmtDate(pool.deliveryDate, lang)}
        </span>
        <span className="row small">
          <Term tip="tip_grade">{t('accepts')}</Term> {pool.grades.map((g) => <GradeTag key={g} g={g} />)}
        </span>
        <span className="small">
          {t('n_shops', { n: shops })} · <span className="num">{num(viable ? best!.totalKg : pool.totalKg)}</span> {t('kg')}
        </span>
        <span style={{ marginLeft: 'auto' }}>{status}</span>
      </header>

      {summary()}

      <button type="button" className="pool-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        <ChevronDown size={18} aria-hidden className="chev" /> {t(open ? 'hide_details' : 'see_details')}
      </button>

      {open && (
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
                    <th className="r"><Term tip="tip_limit" align="end">{t('limit')}</Term></th>
                    <th className="r"><Term tip="tip_alone" align="end">{t('col_alone')}</Term></th>
                    <th className="r">{t('col_now')}</th>
                    <th className="r"><Term tip="tip_diff" align="end">{t('col_diff')}</Term></th>
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
                <h3>{farmerName}</h3>
                <div className="row small muted">
                  {pick(best.supply.variety, lang)} <GradeTag g={best.supply.grade} /> <ListingTags supply={best.supply} promoted={false} /> · {t('ships_from')} {pick(REGIONS[best.supply.region], lang)}
                </div>

                {viable ? (
                  <div className="costs">
                    <div><span>{t('cost_fruit')} <span className="muted small">({num(best.totalKg)} {t('kg')})</span></span><span className="num">{num(best.price!)}</span></div>
                    <div><span>{t('cost_ship')}</span><span className="num">{num(best.ship!)}</span></div>
                    <div><span>{t('cost_fee')}</span><span className="num">{num(best.fee)}</span></div>
                    <div className="total"><span><Term tip="tip_landed">{t('cost_landed')}</Term></span><span><span className="num">{num(best.landed!)}</span> {t('per_kg')}</span></div>
                  </div>
                ) : (
                  <div className="costs">
                    <div><span>{reasonText(best)}</span></div>
                    {best.fullLanded != null && (
                      <div><span><Term tip="tip_landed">{t('cost_landed')}</Term></span><span><span className="num">{num(best.fullLanded)}</span> {t('per_kg')}</span></div>
                    )}
                  </div>
                )}

                {viable && best.next && (
                  <p className="small" style={{ marginTop: 8 }}>
                    {t('next_tier', { n: num(best.next.minKg - best.totalKg), p: num(best.next.price) })}
                  </p>
                )}

                {quotes.length > 1 && (
                  <details className="others">
                    <summary>{t('other_listings')} ({quotes.length - 1})</summary>
                    {quotes.slice(1).map((q) => (
                      <div className="other-row" key={q.supply.id}>
                        <span>
                          {pick(userById(q.supply.farmerId).name, lang)} <GradeTag g={q.supply.grade} /> <ListingTags supply={q.supply} promoted={false} />{' '}
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
      )}
    </article>
  );

  /** The answer to "what does this group mean for me?", in one line and one number. */
  function summary() {
    if (!best) return <div className="pool-summary"><p className="ps-text">{t('ps_no_farmer')}</p></div>;

    if (!viable) {
      return (
        <div className="pool-summary">
          <p className="ps-text">
            <strong>{reasonText(best)}</strong>
            {best.fullLanded != null && <> · {t('ps_if_all', { price: num(best.fullLanded) })}</>}
          </p>
        </div>
      );
    }

    const isBestFarmer = me.id === best.supply.farmerId;
    if (isBestFarmer) {
      return (
        <div className="pool-summary">
          <div className="ps-figure"><span className="num">{num(best.price!)}</span> <span>{t('per_kg')}</span></div>
          <p className="ps-text">{t('ps_farmer', { kg: num(best.totalKg), n: shops, total: num(best.price! * best.totalKg) })}</p>
          <button className="btn big mango" onClick={offer}><Send size={18} aria-hidden /> {t('send_offer')}</button>
        </div>
      );
    }

    const myOrders = pool.demands.filter((d) => d.buyerId === me.id);
    const myIn = myOrders.filter((d) => included.has(d.id));
    if (myOrders.length > 0 && myIn.length === 0) {
      return (
        <div className="pool-summary">
          <div className="ps-figure"><span className="num">{num(best.landed!)}</span> <span>{t('per_kg')}</span></div>
          <p className="ps-text"><strong className="lose">{t('ps_over', { limit: num(myOrders[0].maxCost) })}</strong></p>
        </div>
      );
    }

    // A shop in the group, or someone looking on: the delivered price and who sends the offer.
    const now = myIn.find((d) => d.currentCost != null)?.currentCost;
    const save = now != null ? round2(now - best.landed!) : null;
    return (
      <div className="pool-summary">
        <div className="ps-figure">
          <span className="num">{num(best.landed!)}</span> <span>{t('per_kg')}</span>
          <small><Term tip="tip_landed">{t('cost_landed')}</Term></small>
        </div>
        <p className="ps-text">
          {myIn.length > 0 && save != null && save > 0 && <strong className="save">{t('ps_save', { n: num(save) })} </strong>}
          {t(myIn.length > 0 ? 'ps_wait_you' : 'ps_wait', { farmer: farmerName })}
        </p>
        {me.role === 'farmer' && <p className="small muted ps-hint">{t('offer_hint_other', { farmer: farmerName })}</p>}
      </div>
    );
  }
}
