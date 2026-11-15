import { useEffect, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';

/** YYYY-MM-DD → DD/MM/YYYY */
function display(iso: string): string {
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : '';
}

/**
 * Tidy what the user typed into D/M/Y form. Phone number pads have no "/" key, so slashes are
 * added after the day and month digits ("15112026" → "15/11/2026"); typed "/", "." or "-" also
 * end a part, so "1/5/2026" still works. Backspacing over an added slash just removes it.
 */
function formatTyping(raw: string): string {
  const iso = raw.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); // pasted YYYY-MM-DD
  if (iso) return `${iso[3].padStart(2, '0')}/${iso[2].padStart(2, '0')}/${iso[1]}`;
  const max = [2, 2, 4];
  const parts: string[] = [];
  let cur = '';
  for (const c of raw) {
    if (/[/.\-\s]/.test(c)) {
      if (cur !== '' && parts.length < 2) {
        parts.push(cur);
        cur = '';
      }
    } else if (/\d/.test(c)) {
      if (cur.length === max[parts.length]) {
        if (parts.length === 2) continue; // year is full
        parts.push(cur);
        cur = '';
      }
      cur += c;
    }
  }
  return parts.length ? `${parts.join('/')}/${cur}` : cur;
}

/**
 * DD/MM/YYYY (also D/M/YYYY) → YYYY-MM-DD, or null if not a real date.
 * A Thai Buddhist-era year (e.g. 2569) is read as the same year in CE (2026).
 */
function parseDMY(text: string): string | null {
  const m = text.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const be = Number(m[3]);
  const [d, mo, y] = [Number(m[1]), Number(m[2]), be >= 2400 ? be - 543 : be];
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${y}-${p(mo)}-${p(d)}`;
}

type Props = {
  id: string;
  value: string; // YYYY-MM-DD
  onChange: (iso: string) => void;
  min?: string;
  required?: boolean;
};

/**
 * Date input that always shows DD/MM/YYYY, whatever the browser locale.
 * (A native <input type="date"> follows the OS locale, e.g. MM/DD/YYYY on en-US.)
 * Type the date, or use the calendar button to open the browser's own picker.
 */
export default function DateField({ id, value, onChange, min, required }: Props) {
  const [text, setText] = useState(display(value));
  const textRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);

  // Follow outside changes (picker, form reset).
  useEffect(() => setText(display(value)), [value]);

  // Keep the form's own validation: block submit on a bad or too-early date.
  useEffect(() => {
    const iso = parseDMY(text);
    let msg = '';
    if (text.trim() === '') msg = required ? 'DD/MM/YYYY' : '';
    else if (!iso) msg = 'DD/MM/YYYY';
    else if (min && iso < min) msg = `≥ ${display(min)}`;
    textRef.current?.setCustomValidity(msg);
  }, [text, min, required]);

  const openPicker = () => {
    const el = pickerRef.current;
    if (!el) return;
    try {
      el.showPicker();
    } catch {
      el.focus();
    }
  };

  return (
    <div className="date-field">
      <input
        ref={textRef}
        id={id}
        inputMode="numeric"
        placeholder="DD/MM/YYYY"
        autoComplete="off"
        required={required}
        value={text}
        maxLength={10}
        onChange={(e) => {
          const next = formatTyping(e.target.value);
          setText(next);
          const iso = parseDMY(next);
          if (iso) onChange(iso);
        }}
        onBlur={() => {
          const iso = parseDMY(text);
          if (iso) setText(display(iso));
        }}
      />
      <button type="button" className="date-btn" onClick={openPicker} aria-label="Open calendar" title="Open calendar">
        <CalendarDays size={16} aria-hidden />
      </button>
      <input
        ref={pickerRef}
        type="date"
        className="date-native"
        tabIndex={-1}
        aria-hidden
        min={min}
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
      />
    </div>
  );
}
