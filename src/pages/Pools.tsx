import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../store';
import { usePools } from '../lib/usePools';
import PoolCard from '../components/PoolCard';

export default function Pools() {
  const { state, me, t } = useApp();
  const pools = usePools();
  const { hash } = useLocation();
  const focused = decodeURIComponent(hash.slice(1));
  useEffect(() => {
    if (focused) document.getElementById(focused)?.scrollIntoView({ block: 'start' });
  }, [focused]);

  const isBuyer = me.role === 'buyer';
  // The viewer's own groups first: a shop's orders, or groups a farmer's listings fit. Then ready ones, then by date.
  const isMine = (p: (typeof pools)[number]) =>
    isBuyer ? p.pool.demands.some((d) => d.buyerId === me.id) : p.quotes.some((q) => q.supply.farmerId === me.id);
  const sorted = [...pools].sort(
    (a, b) =>
      Number(isMine(b)) - Number(isMine(a)) ||
      Number(!!b.quotes[0]?.viable) - Number(!!a.quotes[0]?.viable) ||
      a.pool.deliveryDate.localeCompare(b.pool.deliveryDate),
  );

  return (
    <>
      <div className="page-head">
        <h1>{t(isBuyer ? 'nav_pools_b' : 'nav_pools_f')}</h1>
        <p>{t(isBuyer ? 'pools_lede_b' : 'pools_lede_f', { n: state.settings.poolWindowDays })}</p>
      </div>
      {sorted.length === 0 && (
        <div className="empty">
          <p>{t('no_pools')}</p>
          <Link className="btn" to="/board?post=1">{t(isBuyer ? 'post_demand' : 'post_supply')}</Link>
        </div>
      )}
      {sorted.map(({ pool, quotes }) => (
        <PoolCard key={pool.id} pool={pool} quotes={quotes} focus={pool.id === focused} />
      ))}
    </>
  );
}
