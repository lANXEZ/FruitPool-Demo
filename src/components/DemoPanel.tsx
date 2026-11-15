import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Coins, RotateCcw, SlidersHorizontal, UserPlus, X } from 'lucide-react';
import { useApp } from '../store';
import { pick } from '../i18n';

/**
 * Presenter controls, kept out of the product UI: switch who you are viewing as, add an
 * account, reset the data. Lives behind a button in the bottom corner.
 */
export default function DemoPanel() {
  const { state, lang, t, setUser, reset } = useApp();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const buyers = state.users.filter((u) => u.role === 'buyer');
  const farmers = state.users.filter((u) => u.role === 'farmer');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <div className="demo" ref={box}>
      {open && (
        <div className="demo-panel" id="demo-panel" role="dialog" aria-label={t('demo_title')}>
          <div className="spread">
            <strong>{t('demo_title')}</strong>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label={t('close')}><X size={18} aria-hidden /></button>
          </div>
          <p className="small muted">{t('demo_note')}</p>
          <label className="field">
            <span>{t('view_as')}</span>
            <select value={state.currentUserId} onChange={(e) => setUser(e.target.value)}>
              <optgroup label={t('buyers')}>
                {buyers.map((u) => <option key={u.id} value={u.id}>{pick(u.name, lang)}</option>)}
              </optgroup>
              <optgroup label={t('farmers')}>
                {farmers.map((u) => <option key={u.id} value={u.id}>{pick(u.name, lang)}</option>)}
              </optgroup>
            </select>
          </label>
          <div className="row">
            <Link className="btn secondary" to="/join" onClick={() => setOpen(false)}><UserPlus size={16} aria-hidden /> {t('join')}</Link>
            <Link className="btn secondary" to="/revenue" onClick={() => setOpen(false)}><Coins size={16} aria-hidden /> {t('rev_title')}</Link>
            <button className="btn danger" onClick={reset}><RotateCcw size={16} aria-hidden /> {t('reset')}</button>
          </div>
        </div>
      )}
      <button className="demo-fab" aria-expanded={open} aria-controls="demo-panel" onClick={() => setOpen(!open)}>
        <SlidersHorizontal size={16} aria-hidden /> <span className="fab-label">{t('demo_title')}</span>
      </button>
    </div>
  );
}
