import { useMemo } from 'react';
import { useApp } from '../store';
import { buildPools, quotesForPool } from './pool';

/** Pools derived live from current demand and supply, each with its ranked farmer quotes. */
export function usePools() {
  const { state } = useApp();
  return useMemo(() => {
    const pools = buildPools(state.demands, state.settings);
    return pools.map((pool) => ({ pool, quotes: quotesForPool(pool, state.supplies, state.settings) }));
  }, [state.demands, state.supplies, state.settings]);
}
