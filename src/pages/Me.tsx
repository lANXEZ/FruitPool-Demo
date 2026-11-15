import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Plus, Sprout, Store } from 'lucide-react';
import { useApp } from '../store';
import { pick } from '../i18n';
import { REGIONS, ZONES } from '../catalog';
import { needsYou, useTracks } from '../lib/journey';
import TrackCard from '../components/TrackCard';

/** Set by the page that sent the user here, so My page can say what just happened. */
export type Flash = ({ kind: 'demand' | 'supply'; id: string } | { kind: 'joined' }) & { userId: string };

export default function Me() {
  const { me, lang, t } = useApp();
  const { tracks, done } = useTracks();
  const sent = (useLocation().state as { flash?: Flash } | null)?.flash;
  // Only for the user it was meant for: switching user in Demo controls must not carry it over.
  const flash = sent?.userId === me.id ? sent : undefined;
  const isBuyer = me.role === 'buyer';
  const focusId = flash && flash.kind !== 'joined' ? flash.id : undefined;
  const todo = tracks.filter(needsYou).length;

  useEffect(() => {
    if (focusId) document.getElementById(focusId)?.scrollIntoView({ block: 'center' });
  }, [focusId]);

  const where = isBuyer
    ? me.zone && `${t('f_zone')}: ${pick(ZONES[me.zone], lang)}`
    : me.region && `${t('ships_from')}: ${pick(REGIONS[me.region], lang)}`;
  const postLabel = isBuyer ? t('post_demand') : t('post_supply');

  return (
    <>
      <div className="me-head">
        <div>
          <p className="me-role">
            {isBuyer ? <Store size={18} aria-hidden /> : <Sprout size={18} aria-hidden />}
            {pick(me.kind, lang)}
            {where && <span className="muted"> · {where}</span>}
          </p>
          <h1>{pick(me.name, lang)}</h1>
          <p className="me-summary">
            {tracks.length === 0 ? t('me_summary_empty') : todo > 0 ? t('me_summary_todo', { n: todo }) : t('me_summary_wait')}
          </p>
        </div>
        <Link className="btn big" to="/board?post=1"><Plus size={18} aria-hidden /> {postLabel}</Link>
      </div>

      {flash && (
        <div className="flash" role="status">
          <CheckCircle2 size={22} aria-hidden />
          <div>
            <strong>{t(flash.kind === 'demand' ? 'flash_demand' : flash.kind === 'supply' ? 'flash_supply' : 'flash_joined', { name: pick(me.name, lang) })}</strong>
            <p>{t(flash.kind === 'joined' ? (isBuyer ? 'flash_joined_b' : 'flash_joined_f') : 'flash_posted_next')}</p>
          </div>
        </div>
      )}

      {tracks.length === 0 ? (
        <section className="getting-started">
          <h2>{t('gs_title')}</h2>
          <ol>
            {(isBuyer ? ['gs_b1', 'gs_b2', 'gs_b3'] : ['gs_f1', 'gs_f2', 'gs_f3']).map((k) => (
              <li key={k}>{t(k as Parameters<typeof t>[0])}</li>
            ))}
          </ol>
          <Link className="btn big mango" to="/board?post=1"><Plus size={18} aria-hidden /> {postLabel}</Link>
        </section>
      ) : (
        <section>
          <h2 className="section-title">{isBuyer ? t('me_orders') : t('me_sales')}</h2>
          {tracks.map((tr) => <TrackCard key={tr.id} track={tr} focus={tr.id === focusId} />)}
        </section>
      )}

      {done > 0 && (
        <p className="me-done">
          {t('me_done', { n: done })} <Link to="/deals?tab=history">{t('l_history')}</Link>
        </p>
      )}
    </>
  );
}
