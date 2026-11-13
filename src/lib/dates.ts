import type { Lang } from '../types';

const DAY = 86_400_000;

export function today(): string {
  const d = new Date();
  return toISO(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
}

export function toISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function parse(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: string, n: number): string {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** Absolute whole days between two YYYY-MM-DD dates. */
export function daysBetween(a: string, b: string): number {
  return Math.abs(Math.round((parse(b).getTime() - parse(a).getTime()) / DAY));
}

export function signedDays(from: string, to: string): number {
  return Math.round((parse(to).getTime() - parse(from).getTime()) / DAY);
}

/** Short date: "18 Nov" / "18 พ.ย." (no year, so no Buddhist-era ambiguity). */
export function fmtDate(s: string, lang: Lang): string {
  return parse(s).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short' });
}

export function fmtDateTime(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleString(lang === 'th' ? 'th-TH' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
