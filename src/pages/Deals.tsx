import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Check, PackageCheck, Truck, Undo2, FastForward } from 'lucide-react';
import { useApp } from '../store';
import { pick, type Key } from '../i18n';
import { FRUITS, ZONES } from '../catalog';
import { fmtDate, fmtDateTime } from '../lib/dates';
import { GradeTag } from '../components/PoolCard';
import { ACTIVE_DEAL, useDealNext } from '../lib/journey';
import type { Deal, DealStatus } from '../types';

const FLOW: DealStatus[] = ['awaiting', 'confirmed', 'shipped', 'completed'];
const ACTIVE = ACTIVE_DEAL;

export default function Deals() {
  const { state, t } = useApp();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<'active' | 'history'>(params.get('tab') === 'history' ? 'history' : 'active');
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);

  // The deal you are working on (#id) stays in view even after it completes.
  const focused = hash.slice(1);
  const list = state.deals.filter((d) =>
    tab === 'active' ? ACTIVE.includes(d.status) || d.id === focused : !ACTIVE.includes(d.status),
  );

  return (
    <>
      <div className="page-head">
        <h1>{t('nav_deals')}</h1>
        <p>{t('deals_lede')}</p>
      </div>
      <div className="tabs" role="group">
        <button className="chip" aria-pressed={tab === 'active'} onClick={() => setTab('active')}>{t('tab_active')}</button>
        <button className="chip" aria-pressed={tab === 'history'} onClick={() => setTab('history')}>{t('tab_history')}</button>
      </div>
      {list.length === 0 && (
        <div className="empty">
          <p>{t(tab === 'active' ? 'no_deals' : 'no_history')}</p>
          <Link className="btn" to="/me">{t('empty_to_me')}</Link>
        </div>
      )}
      {list.map((d) => <DealCard key={d.id} deal={d} />)}
    </>
  );
}

function statusBadge(s: DealStatus, t: (k: Key) => string) {
  const cls = s === 'completed' || s === 'confirmed' ? 'ok' : s === 'disputed' || s === 'cancelled' ? 'bad' : 'wait';
  return <span className={`badge ${cls}`}>{t(`ds_${s}` as Key)}</span>;
}

function DealCard({ deal }: { deal: Deal }) {
  const app = useApp();
  const { lang, t, num, me, userById } = app;
  const [disputing, setDisputing] = useState(false);
  const [note, setNote] = useState('');
  const next = useDealNext()(deal);

  const landed = deal.pricePerKg + deal.shippingPerKg + deal.feePerKg;
  // Prefer one of my lines that still needs me, in case I have more than one order in this deal.
  const myLines = deal.lines.filter((l) => l.buyerId === me.id);
  const myLine = myLines.find((l) => (deal.status === 'shipped' ? !l.received : !l.confirmed)) ?? myLines[0];
  const isFarmer = me.id === deal.farmerId;
  const nowIdx = FLOW.indexOf(deal.status === 'disputed' ? 'shipped' : deal.status);
  const othersPending =
    (deal.status === 'awaiting' && deal.lines.some((l) => l.buyerId !== me.id && !l.confirmed)) ||
    (deal.status === 'confirmed' && !isFarmer) ||
    (deal.status === 'shipped' && deal.lines.some((l) => l.buyerId !== me.id && !l.received));

  return (
    <article className="deal" id={deal.id}>
      <section>
        <div className="spread">
          <h2>
            {pick(FRUITS[deal.fruit], lang)} <span className="num">{num(deal.totalKg)}</span> {t('kg')}
          </h2>
          {statusBadge(deal.status, t)}
        </div>
        <div className="row small muted" style={{ marginTop: 4 }}>
          {pick(userById(deal.farmerId).name, lang)} <GradeTag g={deal.grade} /> → {pick(ZONES[deal.zone], lang)} · {t('delivery')} {fmtDate(deal.deliveryDate, lang)}
        </div>

        {next && (
          <p className={`deal-next tone-${next.tone}`}>
            <strong>{t(next.tone === 'action' ? 'next_you' : next.tone === 'problem' ? 'next_problem' : 'next_wait')}</strong> {next.msg}
          </p>
        )}

        {deal.status !== 'cancelled' && (
          <div className="steps" aria-hidden>
            {FLOW.map((s, i) => (
              <span key={s} className={i < nowIdx || deal.status === 'completed' ? 'done' : i === nowIdx ? 'now' : ''}>{t(`ds_${s}` as Key)}</span>
            ))}
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('col_shop')}</th>
                <th className="r">{t('kg')}</th>
                <th className="r">{t('order_value')} ({t('baht')})</th>
                <th className="r"></th>
              </tr>
            </thead>
            <tbody>
              {deal.lines.map((l) => (
                <tr key={l.demandId} className={l.buyerId === me.id ? 'mine' : ''}>
                  <td>{pick(userById(l.buyerId).name, lang)}</td>
                  <td className="r num">{num(l.qtyKg)}</td>
                  <td className="r num">{num(l.qtyKg * landed)}</td>
                  <td className="r small">
                    {l.received ? (
                      <span className="badge ok">{t('line_received')}</span>
                    ) : l.confirmed ? (
                      <span className="badge ok">{t('line_confirmed')}</span>
                    ) : (
                      <span className="badge plain">{t('line_pending')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="actions">
          {deal.status === 'awaiting' && myLine && !myLine.confirmed && (
            <button className="btn" onClick={() => app.confirmLine(deal.id, me.id)}><Check size={16} aria-hidden /> {t('a_confirm')}</button>
          )}
          {deal.status === 'awaiting' && isFarmer && (
            <button className="btn danger" onClick={() => app.withdraw(deal.id)}><Undo2 size={16} aria-hidden /> {t('a_withdraw')}</button>
          )}
          {deal.status === 'confirmed' && isFarmer && (
            <button className="btn" onClick={() => app.ship(deal.id)}><Truck size={16} aria-hidden /> {t('a_ship')}</button>
          )}
          {deal.status === 'shipped' && myLine && !myLine.received && (
            <>
              <button className="btn" onClick={() => app.receive(deal.id, me.id)}><PackageCheck size={16} aria-hidden /> {t('a_receive')}</button>
              <button className="btn danger" onClick={() => setDisputing(!disputing)}><AlertTriangle size={16} aria-hidden /> {t('a_dispute')}</button>
            </>
          )}
          {deal.status === 'disputed' && (isFarmer || myLine) && (
            <button className="btn" onClick={() => app.resolve(deal.id)}><Check size={16} aria-hidden /> {t('a_resolve')}</button>
          )}
          {othersPending && (
            <button className="btn secondary" onClick={() => app.actForOthers(deal.id)}><FastForward size={16} aria-hidden /> {t('a_demo_all')}</button>
          )}
        </div>
        {disputing && deal.status === 'shipped' && (
          <form
            className="dispute-box"
            onSubmit={(e) => {
              e.preventDefault();
              app.dispute(deal.id, me.id, note.trim());
              setDisputing(false);
            }}
          >
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('dispute_placeholder')} aria-label={t('a_dispute')} />
            <button className="btn danger" type="submit">{t('send')}</button>
          </form>
        )}
      </section>

      <section>
        <h3>{t('terms')}</h3>
        <div className="costs">
          <div><span>{t('cost_fruit')}</span><span className="num">{num(deal.pricePerKg)}</span></div>
          <div><span>{t('cost_ship')}</span><span className="num">{num(deal.shippingPerKg)}</span></div>
          <div><span>{t('cost_fee')}</span><span className="num">{num(deal.feePerKg)}</span></div>
          <div className="total"><span>{t('cost_landed')}</span><span><span className="num">{num(landed)}</span> {t('per_kg')}</span></div>
        </div>
        <h3 style={{ marginTop: 18 }}>{t('timeline')}</h3>
        <ol className="timeline">
          {[...deal.events].reverse().map((e, i) => (
            <li key={i}>
              <time>{fmtDateTime(e.at, lang)}</time>
              {t(e.key as Key, { who: e.by ? pick(userById(e.by).name, lang) : '' })}
              {e.note && <div className="small muted">“{e.note}”</div>}
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
