import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useApp } from '../store';
import type { Key } from '../i18n';

const TIP_W = 260;

/**
 * A label with a small "?" that explains the term in plain words. A tap target, not a hover
 * tooltip, so it works on phones. The explanation is positioned against the window, because
 * terms sit inside scrolling tables and cards that would clip it. Closes on Escape, a tap
 * elsewhere, or scrolling.
 */
export default function Term({ children, tip, align = 'start' }: { children: ReactNode; tip: Key; align?: 'start' | 'end' }) {
  const { t } = useApp();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const id = useId();
  const box = useRef<HTMLSpanElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const open = pos !== null;

  const place = () => {
    if (!btn.current) return;
    const r = btn.current.getBoundingClientRect();
    const width = Math.min(TIP_W, window.innerWidth - 32);
    const want = align === 'end' ? r.right - width : r.left;
    setPos({ top: r.bottom + 6, left: Math.max(16, Math.min(want, window.innerWidth - width - 16)) });
  };
  const toggle = () => (open ? setPos(null) : place());

  useEffect(() => {
    if (!open) return;
    const close = () => setPos(null);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onDown = (e: PointerEvent) => !box.current?.contains(e.target as Node) && close();
    // Follow the "?" when the page or a table scrolls, rather than closing on the slightest movement.
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
    // place reads the latest button position on each call; it doesn't need to be a dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <span className="term" ref={box}>
      {children}
      <button
        ref={btn}
        type="button"
        className="term-q"
        aria-label={t('what_is_this')}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={toggle}
      >
        ?
      </button>
      {pos && (
        <span role="tooltip" id={id} className="term-tip" style={{ top: pos.top, left: pos.left, width: Math.min(TIP_W, window.innerWidth - 32) }}>
          {t(tip)}
        </span>
      )}
    </span>
  );
}
