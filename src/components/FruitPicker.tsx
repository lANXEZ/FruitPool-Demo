import { useEffect, useId, useMemo, useState, type KeyboardEvent } from 'react';
import { FRUITS, FRUIT_IDS, type FruitId } from '../catalog';
import { useApp } from '../store';
import { pick } from '../i18n';
import type { Lang } from '../types';

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
const names = (id: FruitId) => [FRUITS[id].th, FRUITS[id].en, ...(FRUITS[id].aliases ?? [])].map(norm);

/** Fruits matching the query in Thai, English or an alias, whatever the UI language. Prefix matches first. */
function search(query: string, lang: Lang): FruitId[] {
  const sorted = [...FRUIT_IDS].sort((a, b) => pick(FRUITS[a], lang).localeCompare(pick(FRUITS[b], lang), lang));
  const q = norm(query);
  if (!q) return sorted;
  const starts = sorted.filter((id) => names(id).some((n) => n.startsWith(q)));
  const contains = sorted.filter((id) => !starts.includes(id) && names(id).some((n) => n.includes(q)));
  return [...starts, ...contains];
}

const exactMatch = (query: string) => {
  const q = norm(query);
  return q ? FRUIT_IDS.find((id) => names(id).includes(q)) : undefined;
};

/**
 * Searchable fruit field. Users type to filter, but the value is always a fruit from the list:
 * pools match on fruit id, so free text would split orders that should pool together.
 */
export default function FruitPicker({ id, value, onChange }: { id: string; value: FruitId; onChange: (f: FruitId) => void }) {
  const { lang, t } = useApp();
  const listId = useId();
  const [query, setQuery] = useState<string | null>(null); // null = closed, showing the chosen fruit
  const [active, setActive] = useState(0);
  const open = query !== null;
  const results = useMemo(() => (open ? search(query, lang) : []), [open, query, lang]);
  const optionId = (i: number) => `${listId}-o${i}`;

  useEffect(() => {
    if (open) document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
  });

  const openList = () => {
    setQuery('');
    setActive(0);
  };
  const choose = (f: FruitId) => {
    onChange(f);
    setQuery(null);
  };
  // Leaving the field keeps a typed name only if it exactly names a fruit; otherwise the last choice stays.
  const leave = () => {
    const m = query ? exactMatch(query) : undefined;
    if (m) onChange(m);
    setQuery(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) openList();
      else setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && open) {
      e.preventDefault(); // pick a fruit, don't submit the form
      if (results[active]) choose(results[active]);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      setQuery(null);
    }
  };

  return (
    <div className="combo">
      <input
        id={id}
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && results[active] ? optionId(active) : undefined}
        value={open ? query : pick(FRUITS[value], lang)}
        placeholder={pick(FRUITS[value], lang)}
        onFocus={openList}
        onClick={() => !open && openList()}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
        }}
        onBlur={leave}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul className="combo-list" id={listId} role="listbox">
          {results.length === 0 && <li className="combo-empty">{t('no_fruit', { q: query })}</li>}
          {results.map((f, i) => (
            <li
              key={f}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              className={f === value ? 'current' : undefined}
              onMouseDown={(e) => {
                e.preventDefault(); // keep focus so blur doesn't fire first
                choose(f);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <span>{pick(FRUITS[f], lang)}</span>
              <span className="alt">{pick(FRUITS[f], lang === 'th' ? 'en' : 'th')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
