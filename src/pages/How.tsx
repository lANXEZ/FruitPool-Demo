import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../store';
import { usePools } from '../lib/usePools';
import PoolCard from '../components/PoolCard';
import type { Key } from '../i18n';

const STEPS = [1, 2, 3, 4, 5, 6, 7] as const;

export default function How() {
  const { state, t, num } = useApp();
  const pools = usePools();
  const open = state.demands.filter((d) => d.status === 'open').length;
  const listings = state.supplies.filter((s) => s.qtyKg > 0).length;
  const viable = pools.filter((p) => p.quotes[0]?.viable).length;
  // The concept doc's example pool (shown only while it is still open; Reset demo brings it back).
  const example = pools.find((p) => p.pool.demands.some((d) => d.id === 'd1') && p.quotes[0]?.viable);

  return (
    <>
      <section className="hero">
        <div>
          <h1>{t('home_title')}</h1>
          <p className="lede">{t('home_lede')}</p>
          <div className="row">
            <Link className="btn" to="/pools">{t('home_open_pools')} <ArrowRight size={16} aria-hidden /></Link>
            <Link className="btn secondary" to="/board">{t('home_open_board')}</Link>
          </div>
        </div>
        <div className="stats">
          <div><span className="num">{num(open)}</span><span className="small muted">{t('stat_demands')}</span></div>
          <div><span className="num">{num(listings)}</span><span className="small muted">{t('stat_supplies')}</span></div>
          <div><span className="num">{num(pools.length)}</span><span className="small muted">{t('stat_pools')}</span></div>
          <div><span className="num">{num(viable)}</span><span className="small muted">{t('stat_viable')}</span></div>
        </div>
      </section>

      <section>
        <h2>{t('home_flow')}</h2>
        <ol className="flow">
          {STEPS.map((n) => (
            <li key={n}>
              <strong>{t(`step${n}` as Key)}</strong>
              <span>{t(`step${n}d` as Key)}</span>
            </li>
          ))}
        </ol>
      </section>

      {example && (
        <section className="example">
          <h2>{t('home_example')}</h2>
          <p className="muted" style={{ margin: '6px 0 14px' }}>{t('home_example_note')}</p>
          <PoolCard pool={example.pool} quotes={example.quotes} defaultOpen />
        </section>
      )}
    </>
  );
}
