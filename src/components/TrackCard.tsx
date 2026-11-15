import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Check, Clock, Hand } from 'lucide-react';
import { useApp } from '../store';
import type { Track } from '../lib/journey';

const TONE_ICON = { action: Hand, wait: Clock, problem: AlertTriangle };

/** One order or listing: a four-step tracker, a plain sentence about where it stands, and the next button. */
export default function TrackCard({ track, focus }: { track: Track; focus?: boolean }) {
  const { t } = useApp();
  const Icon = TONE_ICON[track.tone];

  return (
    <article id={track.id} className={`track tone-${track.tone} ${focus ? 'focus' : ''}`}>
      <header className="track-head">
        <h3>{track.title}</h3>
        <span className="small muted">{track.sub}</span>
        {track.tone === 'action' && <span className="badge todo">{t('badge_todo')}</span>}
        {track.tone === 'problem' && <span className="badge bad">{t('badge_problem')}</span>}
      </header>

      <ol className="tracker" aria-label={t('progress')}>
        {track.steps.map((s, i) => (
          <li key={s} className={i < track.current ? 'done' : i === track.current ? 'now' : ''} aria-current={i === track.current ? 'step' : undefined}>
            <span className="dot" aria-hidden>{i < track.current ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
            <span className="label">{s}</span>
          </li>
        ))}
      </ol>

      <div className="track-next">
        <Icon size={20} aria-hidden className="track-icon" />
        <p>{track.msg}</p>
        {track.action && (
          <Link className={`btn big ${track.tone === 'action' ? 'mango' : ''}`} to={track.action.to}>
            {track.action.label} <ArrowRight size={18} aria-hidden />
          </Link>
        )}
        {track.link && (
          <Link className="btn secondary" to={track.link.to}>{track.link.label}</Link>
        )}
      </div>
    </article>
  );
}
