import { Handshake, Megaphone, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useApp } from '../store';
import { pick, type Key } from '../i18n';
import { FRUITS } from '../catalog';
import { fmtDate, toISO } from '../lib/dates';
import { revenue, type Stream } from '../lib/revenue';

const STREAMS: { stream: Stream; Icon: LucideIcon; name: Key; who: Key; when: Key }[] = [
  { stream: 'deal', Icon: Handshake, name: 'rev_deal', who: 'rev_deal_who', when: 'rev_deal_when' },
  { stream: 'verify', Icon: ShieldCheck, name: 'rev_verify', who: 'rev_verify_who', when: 'rev_verify_when' },
  { stream: 'feature', Icon: Megaphone, name: 'rev_feature', who: 'rev_feature_who', when: 'rev_feature_when' },
];

/**
 * FRUITPOOL's own income, for presenting the business model. Reached from Demo controls and
 * How it works, not from the shop or farmer menus. Every figure is computed from the demo data.
 */
export default function Revenue() {
  const { state, lang, t, num, userById } = useApp();
  const r = revenue(state);
  const { feePerKg, verifyFee, featureFee, featureDays } = state.settings;
  const price: Record<Stream, string> = {
    deal: t('rev_price_deal', { n: num(feePerKg) }),
    verify: t('rev_price_verify', { n: num(verifyFee) }),
    feature: t('rev_price_feature', { n: num(featureFee), d: featureDays }),
  };
  const supplyName = (id: string) => {
    const s = state.supplies.find((x) => x.id === id);
    return s ? `${pick(FRUITS[s.fruit], lang)} ${pick(s.variety, lang) === pick(FRUITS[s.fruit], lang) ? '' : pick(s.variety, lang)}`.trim() : '';
  };

  return (
    <>
      <div className="page-head">
        <h1>{t('rev_title')}</h1>
        <p>{t('rev_lede')}</p>
      </div>
      <p className="scope-note">{t('rev_scope')}</p>

      <div className="rev-kpis">
        <div className="kpi rev-total">
          <strong>{t('rev_total')}</strong>
          <span className="num">{num(r.total)} {t('baht')}</span>
          <span className="small">{t('rev_rows', { n: r.ledger.length })}</span>
        </div>
        {STREAMS.map(({ stream, Icon, name }) => (
          <div className="kpi rev-stream" key={stream}>
            <strong><Icon size={16} aria-hidden /> {t(name)}</strong>
            <span className="num">{num(r[stream].amount)} {t('baht')}</span>
            <span className="small">
              {stream === 'deal' ? t('rev_deal_n', { n: r.deal.count, kg: num(r.deal.kg) }) : t('rev_count', { n: r[stream].count })}
            </span>
          </div>
        ))}
      </div>
      {r.toCome.count > 0 && (
        <p className="small muted" style={{ marginTop: -12, marginBottom: 24 }}>
          {t('rev_to_come', { n: r.toCome.count, amount: num(r.toCome.amount) })}
        </p>
      )}

      <section className="panel" style={{ marginBottom: 24 }}>
        <h2>{t('rev_how')}</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>{t('rev_col_stream')}</th><th>{t('rev_col_who')}</th><th>{t('rev_col_when')}</th><th className="r">{t('rev_col_price')}</th></tr>
            </thead>
            <tbody>
              {STREAMS.map(({ stream, Icon, name, who, when }) => (
                <tr key={stream}>
                  <td><span className="row" style={{ flexWrap: 'nowrap' }}><Icon size={16} aria-hidden /> <strong>{t(name)}</strong></span></td>
                  <td>{t(who)}</td>
                  <td>{t(when)}</td>
                  <td className="r">{price[stream]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted" style={{ marginTop: 10 }}>{t('rev_fair')}</p>
      </section>

      <section className="panel">
        <h2>{t('rev_ledger')}</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>{t('rev_col_date')}</th><th>{t('rev_col_stream')}</th><th>{t('rev_col_farmer')}</th><th>{t('rev_col_item')}</th><th className="r">{t('baht')}</th></tr>
            </thead>
            <tbody>
              {r.ledger.map((row) => (
                <tr key={row.id}>
                  <td className="small">{fmtDate(toISO(new Date(row.at)), lang)}</td>
                  <td>{t(STREAMS.find((x) => x.stream === row.stream)!.name)}</td>
                  <td>{pick(userById(row.farmerId).name, lang)}</td>
                  <td className="small">
                    {supplyName(row.supplyId)}
                    {row.kg != null && <> · <span className="num">{num(row.kg)}</span> {t('kg')}</>}
                  </td>
                  <td className="r num">{num(row.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="rev-sum"><td colSpan={4}>{t('rev_total')}</td><td className="r num">{num(r.total)}</td></tr>
            </tfoot>
          </table>
        </div>
      </section>
    </>
  );
}
