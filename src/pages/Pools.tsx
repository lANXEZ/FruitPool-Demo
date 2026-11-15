import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../store';
import { usePools } from '../lib/usePools';
import PoolCard from '../components/PoolCard';

export default function Pools() {
  const { state, t } = useApp();
  const pools = usePools();
  const { hash } = useLocation();
  const focused = decodeURIComponent(hash.slice(1));
  useEffect(() => {
    if (focused) document.getElementById(focused)?.scrollIntoView({ block: 'start' });
  }, [focused]);
  // Viable pools first, then by delivery date.
  const sorted = [...pools].sort(
    (a, b) => Number(!!b.quotes[0]?.viable) - Number(!!a.quotes[0]?.viable) || a.pool.deliveryDate.localeCompare(b.pool.deliveryDate),
  );

  return (
    <>
      <div className="page-head">
        <h1>{t('nav_pools')}</h1>
        <p>{t('pools_lede', { n: state.settings.poolWindowDays })}</p>
      </div>
      {sorted.length === 0 && (
        <div className="empty">
          <p>{t('no_pools')}</p>
          <Link className="btn" to="/board?post=1">{t('empty_post')}</Link>
        </div>
      )}
      {sorted.map(({ pool, quotes }) => (
        <PoolCard key={pool.id} pool={pool} quotes={quotes} focus={pool.id === focused} />
      ))}
    </>
  );
}
