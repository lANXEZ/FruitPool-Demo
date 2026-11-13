import { useApp } from '../store';
import { usePools } from '../lib/usePools';
import PoolCard from '../components/PoolCard';

export default function Pools() {
  const { state, t } = useApp();
  const pools = usePools();
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
      {sorted.length === 0 && <p className="empty">{t('no_pools')}</p>}
      {sorted.map(({ pool, quotes }) => (
        <PoolCard key={pool.id} pool={pool} quotes={quotes} />
      ))}
    </>
  );
}
